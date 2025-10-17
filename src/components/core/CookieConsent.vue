<template>
    <div
        v-if="showBanner"
        class="fixed bottom-5 left-5 right-5 z-[9999] max-w-4xl mx-auto"
    >
        <div class="bg-white/80 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl shadow-black/10 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-3xl hover:shadow-black/15">
            <div class="p-6 flex flex-col gap-5">
                <div class="flex items-start gap-4">
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-lg flex-shrink-0 shadow-lg shadow-indigo-500/30">
                        <v-icon icon="mdi-cookie" class="text-white drop-shadow-md" size="32"></v-icon>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-gray-800 mb-2 leading-tight font-['Libre_Baskerville',serif]">
                            {{ $t("weUseCookiesLabel") }}
                        </h3>
                        <p class="text-sm text-gray-600 leading-relaxed font-normal">
                            {{ $t("cookiesExplanationMessage") }}
                        </p>
                    </div>
                </div>
                
                <div class="flex gap-3 flex-wrap">
                    <button 
                        class="inline-flex items-center justify-center px-5 py-3 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 border-none cursor-pointer transition-all duration-200 ease-out hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 active:translate-y-0 min-h-[44px] whitespace-nowrap"
                        @click="acceptAll"
                    >
                        <v-icon icon="mdi-check" size="18" class="mr-2"></v-icon>
                        {{ $t("acceptAllLabel") }}
                    </button>
                    <button 
                        class="inline-flex items-center justify-center px-5 py-3 rounded-lg font-semibold text-sm text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/50 cursor-pointer transition-all duration-200 ease-out hover:bg-white/95 hover:text-gray-700 hover:border-gray-200/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 active:translate-y-0 min-h-[44px] whitespace-nowrap"
                        @click="declineTracking"
                    >
                        <v-icon icon="mdi-close" size="18" class="mr-2"></v-icon>
                        {{ $t("acceptNecessaryLabel") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
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
  