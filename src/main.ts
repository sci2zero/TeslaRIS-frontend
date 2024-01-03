import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";
import { jwtDecode } from "jwt-decode";
import './assets/main.css';
import i18n, {defaultLocale, supportedLocales} from './i18n';

const pinia = createPinia();

loadFonts();
i18n.setup();

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
