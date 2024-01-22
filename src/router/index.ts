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
import JournalListView from "@/views/JournalListView.vue";
import PublisherListView from "@/views/PublisherListView.vue";
import AdvancedSearchView from "@/views/AdvancedSearchView.vue";
import UserProfileView from "@/views/UserProfileView.vue";
import SubmitConferenceView from "@/views/SubmitConferenceView.vue";
import SubmitPublisherView from "@/views/SubmitPublisherView.vue";
import SubmitPersonView from "@/views/SubmitPersonView.vue";


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
                    path: "user-profile",
                    name: "userProfile",
                    component: UserProfileView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
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
                    path: "submit-conference",
                    name: "submitConference",
                    component: SubmitConferenceView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
                },
                {
                    path: "submit-publisher",
                    name: "submitPublisher",
                    component: SubmitPublisherView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
                },
                {
                    path: "submit-person",
                    name: "submitPerson",
                    component: SubmitPersonView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin, roles.institutionalEditor, roles.researcher],
                    },
                },
                {
                    path: "journals",
                    name: "journals",
                    component: JournalListView,
                    meta: {
                        authenticated: true,
                        authorities: [roles.admin],
                    },
                },
                {
                    path: "publishers",
                    name: "publishers",
                    component: PublisherListView,
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
                    path: "advanced-search",
                    name: "advancedSearch",
                    component: AdvancedSearchView,
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
