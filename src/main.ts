import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";
import './assets/main.css';
import i18n from './i18n';
import { install } from "vue3-recaptcha-v2";

const pinia = createPinia();

loadFonts();
i18n.setup();

createApp(App)
.use(router)
.use(pinia)
.use(vuetify)
.use(i18n.vueI18n)
.use(install, {
    sitekey: import.meta.env.RECAPTCHA_SITE_KEY as string,
    cnDomains: false
  })
.mount("#app");
