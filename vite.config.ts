import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { version } from './package.json'
import tailwindcss from '@tailwindcss/vite'
import { localPlugins } from "./vite-plugin-local-plugins";

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vuetify({
            autoImport: true,
        }),
        tailwindcss(),
        localPlugins(),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
        // Plugin sources live outside this project, so bare imports such as
        // the Vuetify auto-import must resolve from this app's node_modules.
        dedupe: ["vue", "vuetify"],
    },
    define: {
        'import.meta.env.VITE_APP_VERSION_PACKAGE': JSON.stringify(version)
    },
});
