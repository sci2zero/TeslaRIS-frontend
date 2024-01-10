import { createRouter, createWebHistory } from "vue-router";
import { defaultLocale } from '@/i18n'
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import UserListView from "@/views/UserListView.vue";
import EventListView from "@/views/EventListView.vue";
import PersonListView from "@/views/PersonListView.vue";
import AccountActivationView from "@/views/AccountActivationView.vue";
import OrganisationUnitListView from "@/views/OrganisationUnitListView.vue";
import ScientificResultsView from "@/views/ScientificResultsView.vue";


const roles = { researcher: "RESEARCHER", admin: "ADMIN", institutionalEditor: "INSTITUTIONAL_EDITOR" };


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "base",
            redirect: { name: 'home', params: { locale: defaultLocale } },
        },
        {
            path: "/:locale",
            name: "baseLocale",
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
                {
                    path: "register",
                    name: "register",
                    component: RegisterView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "users",
                    name: "users",
                    component: UserListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "events",
                    name: "events",
                    component: EventListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "persons",
                    name: "persons",
                    component: PersonListView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "organisation-units",
                    name: "organisationUnits",
                    component: OrganisationUnitListView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "scientific-results",
                    name: "scientificResults",
                    component: ScientificResultsView,
                    meta: {
                        authenticated: false,
                        authorities: [],
                    },
                },
                {
                    path: "activate-account/:activationToken",
                    name: "activateAccount",
                    component: AccountActivationView,
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
