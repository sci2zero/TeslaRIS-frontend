import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import './assets/main.css'

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

createApp(App)
.use(router)
.use(pinia)
.use(vuetify)
.mount("#app");
