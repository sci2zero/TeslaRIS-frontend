import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";
import { jwtDecode } from "jwt-decode";
import './assets/main.css';
import axios from "axios";
import i18n, {defaultLocale, supportedLocales} from './i18n';

import AuthenticationService from "./services/AuthenticationService";

const pinia = createPinia();

loadFonts();
i18n.setup();

// Configure axios to always include JWT and JWT-fingerprint when sending a request
axios.defaults.withCredentials = true;
axios.interceptors.request.use(
    (config) => {
      const jwt: string | null = sessionStorage.getItem("jwt");
      if (jwt) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${jwt}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

axios.interceptors.response.use(
  (response) => {
    // Pass the response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    originalRequest._retry = true;
    if (error.response.status === 401 && originalRequest._retry) {
      originalRequest._retry = false;

      const refreshToken: string | null = sessionStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await AuthenticationService.refreshToken({refreshTokenValue: refreshToken});
          sessionStorage.setItem("jwt", response.data.token);
          sessionStorage.setItem("refreshToken", response.data.refreshToken);

          return axios(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    return error;
  }
);

router.beforeEach((to: any, from: any, next: any) => {
    const newLocale: string = to.params.locale;
    const prevLocale: string = from.params.locale;

    if (!supportedLocales.includes(newLocale)) {
      next({ name: to.name, params: { locale: defaultLocale } });
      return;
    }

    if (newLocale !== prevLocale) {
      i18n.setLocale(newLocale);
    }

    const { authenticated, authorities } = to.meta;
  
    if (authenticated) {
      const jwt = sessionStorage.getItem("jwt");
      if (jwt) {
        const decodedToken: any = jwtDecode(jwt);
        if (
          authorities.some((authority: string) =>
            decodedToken.role === authority
          )
        ) {
          next();
        } else {
          next({ name: "login", params: { locale: newLocale } });
        }
      } else {
        next({ name: "login", params: { locale: newLocale } });
      }
    } else {
      next();
    }
});

createApp(App)
.use(router)
.use(pinia)
.use(vuetify)
.use(i18n.vueI18n)
.mount("#app");
