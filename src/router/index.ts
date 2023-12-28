import { createRouter, createWebHistory } from "vue-router";
import { defaultLocale } from '../i18n'
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";


// const roles = { researcher: "RESEARCHER", admin: "ADMIN", institutionalEditor: "INSTITUTIONAL_EDITOR" };


const router = createRouter({
    history: createWebHistory(import.meta.env.API_BASE_URL),
    routes: [
        {
            path: "/",
            redirect: `/${defaultLocale}`,
        },
        {
            path: "/:locale",
            children: [
                {
                    path: "",
                    name: "home",
                    component: HomeView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "login",
                    name: "login",
                    component: LoginView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
            ]
        },
    ],
});

export default router;
