<template>
    <div id="footer">
        <footer class="footer-section relative text-center md:text-left">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm z-[2]"></div>
            <div class="z-[2] relative">
                <div class="container mx-auto px-4 py-12">
                    <!-- Main Footer Content -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <!-- Logo and Description -->
                        <div class="col-span-1 md:col-span-2">
                            <div class="text-white">
                                <img src="/logov1.svg" alt="CRIS UNS Logo" class="mx-auto md:mx-0 h-12 md:h-16 w-auto brightness-0 invert opacity-90 mb-4" />
                                <h3 class="text-3xl font-bold text-white mb-3 text-shadow-2xs">
                                    {{ returnCurrentLocaleContent(title) }}
                                </h3>
                                <p class="text-white/90 leading-relaxed text-xs md:text-sm">
                                    {{ returnCurrentLocaleContent(description) }}
                                </p>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div class="col-span-1">
                            <h4 class="text-lg font-semibold text-white text-shadow-xs mb-4">
                                Brzi linkovi
                            </h4>
                            <ul class="list-none p-0 m-0">
                                <li v-for="link in quickLinks" :key="link.title" class="mb-2">
                                    <router-link 
                                        v-if="link.path !== ''" 
                                        :to="'/' + $i18n.locale + '/' + link.path"
                                        class="text-white/80 no-underline block py-1 transition-all duration-300 ease-in-out hover:text-white hover:translate-x-1 hover:text-shadow-2xs">
                                        {{ link.title }}
                                    </router-link>
                                    <router-link 
                                        v-else 
                                        :to="'/' + $i18n.locale"
                                        class="text-white/80 no-underline block py-1 transition-all duration-300 ease-in-out hover:text-white hover:translate-x-1 hover:text-shadow-2xs">
                                        {{ link.title }}
                                    </router-link>
                                </li>
                            </ul>
                        </div>

                        <!-- Contact & Info -->
                        <div class="col-span-1">
                            <h4 class="text-lg font-semibold text-white text-shadow-xs mb-4">
                                Kontakt
                            </h4>
                            <div class="footer-contact">
                                <p class="text-white/80 text-sm flex items-center mb-2">
                                    <v-icon icon="mdi-map-marker" class="mr-2" size="16"></v-icon>
                                    Novi Sad, Srbija
                                </p>
                                <p class="text-white/80 text-sm flex items-center mb-2">
                                    <v-icon icon="mdi-email" class="mr-2" size="16"></v-icon>
                                    <a href="mailto:chenejac@uns.ac.rs" class="text-white/90 no-underline transition-colors duration-300 hover:text-white hover:underline">
                                        chenejac@uns.ac.rs
                                    </a>
                                </p>
                                <p class="text-white/80 text-sm flex items-center">
                                    <v-icon icon="mdi-web" class="mr-2" size="16"></v-icon>
                                    <a href="https://www.uns.ac.rs" target="_blank" class="text-white/90 no-underline transition-colors duration-300 hover:text-white hover:underline">
                                        www.uns.ac.rs
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="border-t border-white/20">
                        <div class="flex flex-col md:flex-row justify-between items-center py-4 border-t border-white/20">
                            <div class="footer-copyright mb-2 md:mb-0">
                                <p class="text-sm text-white/80">
                                    © {{ new Date().getFullYear() }} CRIS UNS. Sva prava zadržana.
                                </p>
                            </div>
                            <div class="text-white/70">
                                <version-link></version-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import VersionLink from './VersionLink.vue';
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import BrandingService from '@/services/BrandingService';




    const i18n = useI18n();
    const homeLabel = computed(() => i18n.t("homeLabel"));
    const personListLabel = computed(() => i18n.t("personListLabel"));
    const ouListLabel = computed(() => i18n.t("ouListLabel"));
    const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));
    const simpleSearchLabel = computed(() => i18n.t("simpleSearchLabel"));
    
    const title = ref();
    const description = ref();

    const quickLinks = ref([
        { title: homeLabel, path: "" },
        { title: personListLabel, path: "persons" },
        { title: ouListLabel, path: "organisation-units" },
        { title: scientificResultsListLabel, path: "scientific-results" },
        { title: simpleSearchLabel, path: "advanced-search" }
    ]);

    onMounted(() => {
        BrandingService.fetchBrandingInfo().then((response) => {
            title.value = response.data.title;
            description.value = response.data.description;
        });


        document.title = `TeslaRIS - ${i18n.t("homeLabel")}`;
    });

</script>

<style scoped>
.footer-section {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
    position: relative;
}

.footer-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
    z-index: 1;
}

</style>
