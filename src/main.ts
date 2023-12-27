import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AuthenticationService from "./services/AuthenticationService";

const pinia = createPinia();

loadFonts();

// Configure axios to always include JWT when sending a request
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

router.beforeEach((to: any, from: any, next: any) => {
    const { authenticated, authorities } = to.meta;
  
    if (authenticated) {
      const jwt = sessionStorage.getItem("jwt");
      if (jwt) {
        const decodedToken: any = jwtDecode(jwt);
        if (
          authorities.some((element: string) =>
            decodedToken.roles.includes(element)
          )
        ) {
          next();
        } else {
          next({ name: "Login" });
        }
      } else {
        next({ name: "Login" });
      }
    } else {
      next();
    }
  });

  axios.interceptors.response.use(
    (response) => {
      // Pass the response
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        const refreshToken: string | null = sessionStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const response = await AuthenticationService.refreshToken({refreshTokenValue: refreshToken});
            sessionStorage.setItem("jwt", response.token);
  
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
      }
  
      return Promise.reject(error);
    }
  );

createApp(App).use(router).use(pinia).use(vuetify).mount("#app");
