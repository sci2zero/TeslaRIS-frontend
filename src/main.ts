import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";

import './assets/vuetify-custom.scss';
import './assets/main.css';
import i18n from './i18n';
import { createHead } from "@vueuse/head";
import { initializeLanguageDetector } from "./utils/LanguageDetector";


async function bootstrap() {
    const pinia = createPinia();
    const head = createHead();

    await initializeLanguageDetector();

    loadFonts();
    i18n.setup();

    createApp(App)
        .use(router)
        .use(pinia)
        .use(vuetify)
        .use(i18n.vueI18n)
        .use(head)
        .mount("#app");
}

bootstrap();
