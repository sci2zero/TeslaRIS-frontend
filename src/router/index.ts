import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";


// const roles = { researcher: "RESEARCHER", admin: "ADMIN", institutionalEditor: "INSTITUTIONAL_EDITOR" };


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
            meta: {
                authenticated: false,
                authorities: [],
            },
        },
        {
            path: "/login",
            name: "login",
            component: LoginView,
            meta: {
                authenticated: false,
                authorities: [],
            },
        },
    ],
});

export default router;
