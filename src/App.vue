<template>
    <v-app>
        <v-main>
            <navbar />
            <router-view :key="$route.params.id" />
        </v-main>
        <footerbar />
    </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import navbar from "@/components/core/Navbar.vue";
import axios from "axios";
import AuthenticationService from "./services/AuthenticationService";
import { useRoute, useRouter } from "vue-router";
import { useLoginStore } from '@/stores/loginStore';
import { jwtDecode } from "jwt-decode";
import i18n, {fallbackLocale, supportedLocales} from './i18n';
import { useRouteStore } from "./stores/routeStore";
import footerbar from "./components/core/FooterBar.vue";


export default defineComponent({
    name: "App",
    components: {navbar, footerbar},
    beforeMount() {
        const route = useRoute();
        const router = useRouter();
        const loginStore = useLoginStore();
        const routeStore = useRouteStore();

        router.beforeEach((to: any, from: any, next: any) => {
            const newLocale: string = to.params.locale;
            const prevLocale: string = from.params.locale;

            if (!supportedLocales.includes(newLocale)) {
                next({ name: to.name, params: { ...to.params, locale: fallbackLocale } });
                return;
            }

            if (newLocale !== prevLocale) {
                i18n.setLocale(newLocale);
            }

            const { authenticated, authorities } = to.meta;
        
            if (authenticated) {
                const jwt = localStorage.getItem("jwt");
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
                        routeStore.setRoute(to.name);
                    }
                } else {
                    next({ name: "login", params: { locale: newLocale } });
                    if (from.name !== to.name) {
                        routeStore.setRoute(to.name);
                    }
                }
            } else {
                next();
            }
        });

        // Configure axios to always include JWT and JWT-fingerprint when sending a request
        axios.defaults.withCredentials = true;
        axios.interceptors.request.use(
            (config) => {
                const jwt: string | null = localStorage.getItem("jwt");
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

        axios.interceptors.response.use(
            (response) => {
                // Pass the response
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                if (!originalRequest.url.endsWith("/user/authenticate") 
                    && !originalRequest.url.endsWith("/user/takeRole") 
                    && !originalRequest.url.endsWith("/user/refresh-token") 
                    && error.response) {
                    if (error.response.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true;
                
                        const refreshToken: string | null = localStorage.getItem("refreshToken");
                        if (refreshToken) {
                            try {
                                const response = await AuthenticationService.refreshToken({refreshTokenValue: refreshToken});
                                
                                localStorage.setItem("jwt", response.data.token);
                                localStorage.setItem("refreshToken", response.data.refreshToken);
                    
                                return axios(originalRequest);
                            } catch (refreshError: any) {
                                if (refreshError.response.status === 400 || refreshError.response.status === 409) {
                                    await new Promise(resolve => setTimeout(resolve, 300));
                                    return axios(originalRequest);
                                } 
                                AuthenticationService.logoutUser();
                                loginStore.userLoggedOut();
                                routeStore.setRoute(route.name?.toString() as string);
                                router.push({ name: "login" });
                                return Promise.reject(refreshError);
                            }
                        }
                    }
                }
                return Promise.reject(error);
            }
        );
    }
});
</script>

<style>
    /* @import "./assets/main.css"; */
</style>