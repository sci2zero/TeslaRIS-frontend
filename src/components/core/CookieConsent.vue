<template>
    <v-banner
        v-if="showBanner"
        elevation="4"
        color="primary"
        class="rounded-lg pa-4 d-flex align-center justify-between"
    >
        <div>
            <h3 class="text-h6 font-weight-medium mb-1">
                {{ $t("weUseCookiesLabel") }}
            </h3>
            <p class="text-body-2">
                {{ $t("cookiesExplanationMessage") }}
            </p>
        </div>
  
        <div class="d-flex flex-column flex-sm-row ga-2 mt-4 ml-5 mt-sm-0">
            <v-btn color="success" variant="flat" @click="acceptAll">
                {{ $t("acceptAllLabel") }}
            </v-btn>
            <v-btn color="error" variant="outlined" @click="declineTracking">
                {{ $t("acceptNecessaryLabel") }}
            </v-btn>
        </div>
    </v-banner>
</template>
  
<script lang="ts">
import CookieService from '@/services/CookieService';
import { defineComponent, ref, onMounted } from 'vue'
  

export default defineComponent({
    name: "CookieConsent",
    setup() {
        const showBanner = ref(false);
  
        const getCookie = (name: string): string | null => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        };
  
        const setOptOutCookie = (value: boolean) => {
            CookieService.setCookiePreferences(value);
        };
  
        const acceptAll = () => {
            showBanner.value = false;
            setOptOutCookie(false);
        };
  
        const declineTracking = () => {
            showBanner.value = false;
            setOptOutCookie(true);
        };
    
        onMounted(() => {
            const optOutCookie = getCookie("tracking_opt_out");
            if (optOutCookie === null) {
                showBanner.value = true;
            }
        });
    
        return {
            showBanner,
            acceptAll,
            declineTracking,
        };
    },
  })
  </script>
  
  <style scoped>

  .v-banner {
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 9999;
  }
  
  </style>
  