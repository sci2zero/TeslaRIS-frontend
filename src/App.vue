<template>
    <v-app class="bg-slate-100">
        <SideBar class="h-full" v-if="!hideLayout" />
        <v-main class="bg-slate-100" :class="['flex flex-col h-full transition-all duration-300', sidebarStore.mainMargin]">
            <navbar v-if="!hideLayout && !isHome" variant="general" :show-breadcrumbs="!isHome" />

            <router-view
                class="flex-1"
                :key="$route.path"
            />

            <footerbar v-if="!hideLayout" />
            
            <cookie-consent
                v-if="!hideLayout"
            />

            <download-progress
                ref="downloadProgressRef"
            />

            <upload-progress
                ref="uploadProgressRef"
            />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import axios from "axios";
import AuthenticationService from "./services/AuthenticationService";
import { useRoute, useRouter } from "vue-router";
import { useLoginStore } from '@/stores/loginStore';
import { jwtDecode } from "jwt-decode";
import i18n, {fallbackLocale, supportedLocales} from './i18n';
import { useRouteStore } from "./stores/routeStore";
import CookieConsent from "./components/core/CookieConsent.vue";
import { useScriptLoader } from "./composables/useScriptLoader";
import DownloadProgress from "./components/core/DownloadProgress.vue";
import { useDownloadStore } from "./stores/downloadStore";
import { useUploadStore } from "./stores/uploadStore";
import UploadProgress from "./components/core/UploadProgress.vue";
import Navbar from "@/components/core/MainNavbar.vue";
import Footerbar from "@/components/core/FooterBar.vue";
import SideBar from "@/components/core/SideBar.vue";
import { useSidebarStore } from "@/stores/sidebarStore";


export default defineComponent({
    name: "App",
    components: { CookieConsent, DownloadProgress, UploadProgress, Navbar, Footerbar, SideBar },
    setup() {
        const route = useRoute();

        const downloadProgressRef = ref<typeof DownloadProgress>();
        const uploadProgressRef = ref<typeof UploadProgress>();
        const downloadStore = useDownloadStore();
        const uploadStore = useUploadStore();

        const hideLayout = computed(() => {
            return (
                route.name === "publicDissertationsReport" &&
                route.query.embed === "true"
            );
        });

        const isHome = computed(() => {
            return route.name === "home";
        });
        const sidebarStore = useSidebarStore();

        onMounted(async () => {
            try {
                await useScriptLoader("//d1bxh8uas1mnw7.cloudfront.net/assets/embed.js");
                await useScriptLoader("//badge.dimensions.ai/badge.js");
                await useScriptLoader("//cdn.plu.mx/widget-all.js");
            } catch (e) {
                console.error('Failed to load static script:', e)
            }

            downloadStore.setGlobalDownloadProgressRef(downloadProgressRef.value as typeof DownloadProgress);
            uploadStore.setGlobalUploadProgressRef(uploadProgressRef.value as typeof UploadProgress);
        });

        return {
            hideLayout,
            downloadProgressRef,
            uploadProgressRef,
            isHome,
            sidebarStore
        };
    },
    beforeMount() {
        const route = useRoute();
        const router = useRouter();
        const loginStore = useLoginStore();
        loginStore.initialize();
        const routeStore = useRouteStore();

        router.beforeEach((to: any, from: any, next: any) => {
            const newLocale: string = to.params.locale;
            const prevLocale: string = from.params.locale;
            if (newLocale === undefined) {
                next();
                return;
            }

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
                        if (to.name === "login") {
                            routeStore.setRouteAndParams(from.name, from.params);
                        }
                        next();
                    } else {
                        next({ name: "login", params: { locale: newLocale } });
                        routeStore.setRouteAndParams(to.name, to.params);
                    }
                } else {
                    next({ name: "login", params: { locale: newLocale } });
                    if (from.name !== to.name) {
                        routeStore.setRouteAndParams(to.name, to.params);
                    }
                }
            } else {
                if (to.name === "login") {
                    if (loginStore.explicitlyLoggedOut) {
                        loginStore.reachedLoginPage();
                    } else {
                        if (from.name !== "notFound") {
                            routeStore.setRouteAndParams(from.name, from.params);
                        }
                    }
                }

                if (to.name === "notFound") {
                    routeStore.setRouteAndParams(from.name, from.params);
                }
                
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
                                routeStore.setRouteAndParams(route.name?.toString() as string, route.params);
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

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .v-main {
        margin-left: 0 !important;
    }
}
</style>