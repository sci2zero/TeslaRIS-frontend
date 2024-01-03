<template>
    <v-app>
        <v-main>
            <navbar />
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import navbar from "@/components/core/Navbar.vue";
import axios from "axios";
import AuthenticationService from "./services/AuthenticationService";
import { useRouter } from "vue-router";
import { useLoginStore } from '@/stores/loginStore';

export default defineComponent({
    name: "App",
    components: {navbar},
    beforeMount() {
        const router = useRouter();
        const loginStore = useLoginStore();

        // Configure axios to always include JWT and JWT-fingerprint when sending a request
        axios.defaults.withCredentials = true;
        axios.interceptors.request.use(
            (config) => {
            const jwt: string | null = sessionStorage.getItem("jwt");
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
            console.log(originalRequest)
            if (!originalRequest.url.endsWith("/user/authenticate") 
                && !originalRequest.url.endsWith("/user/takeRole") 
                && !originalRequest.url.endsWith("/user/refresh-token") 
                && error.response) {
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
        
                const refreshToken: string | null = sessionStorage.getItem("refreshToken");
                if (refreshToken) {
                try {
                    const response = await AuthenticationService.refreshToken({refreshTokenValue: refreshToken});
                    sessionStorage.setItem("jwt", response.data.token);
                    sessionStorage.setItem("refreshToken", response.data.refreshToken);
        
                    return axios(originalRequest);
                } catch (refreshError) {
                    AuthenticationService.logoutUser();
                    loginStore.userLoggedOut();
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