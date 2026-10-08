<template>
    <div id="footer">
        <footer
            class="footer-section relative text-center md:text-left"
            :class="{ 'footer-section--light': theme === 'light' }">
            <div v-if="theme !== 'light'" class="absolute inset-0 bg-black/40 backdrop-blur-sm z-[2]" />
            <div class="z-[2] relative">
                <div class="container mx-auto px-8 py-12">
                    <!-- Main Footer Content -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <!-- Logo and Description -->
                        <div class="col-span-1 md:col-span-2">
                            <div class="footer-brand">
                                <img
                                    :src="logoUrl"
                                    alt=""
                                    :class="[
                                        'mx-auto md:mx-0 h-12 md:h-16 w-auto mb-4',
                                        hasCustomLogo
                                            ? 'opacity-90'
                                            : theme === 'light'
                                                ? 'brightness-0 opacity-90'
                                                : 'brightness-0 invert opacity-90'
                                    ]"
                                >
                                <h3 class="footer-title text-3xl font-bold mb-3">
                                    {{ localizedTitle }}
                                </h3>
                                <p class="footer-body leading-relaxed text-xs md:text-sm">
                                    {{ localizedDescription }}
                                </p>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div class="col-span-1">
                            <h4 class="footer-heading text-lg font-semibold mb-4">
                                {{ $t('footer.quickLinks') }}
                            </h4>
                            <ul class="list-none p-0 m-0">
                                <li v-for="link in quickLinks" :key="link.title" class="mb-2">
                                    <router-link 
                                        v-if="link.path !== ''" 
                                        :to="'/' + $i18n.locale + '/' + link.path"
                                        class="footer-link no-underline block py-1 transition-all duration-300 ease-in-out hover:translate-x-1">
                                        {{ link.title }}
                                    </router-link>
                                    <router-link 
                                        v-else 
                                        :to="'/' + $i18n.locale"
                                        class="footer-link no-underline block py-1 transition-all duration-300 ease-in-out hover:translate-x-1">
                                        {{ link.title }}
                                    </router-link>
                                </li>
                            </ul>
                        </div>

                        <!-- Contact & Info -->
                        <div class="col-span-1">
                            <h4 class="footer-heading text-lg font-semibold mb-4">
                                {{ $t('footer.contact') }}
                            </h4>
                            <div class="footer-contact">
                                <p class="footer-muted text-sm flex items-center mb-2">
                                    <v-icon icon="mdi-map-marker" class="mr-2" size="16" />
                                    {{ formattedAddress || $t('footer.location') }}
                                </p>
                                <p v-if="phoneNumber" class="footer-muted text-sm flex items-center mb-2">
                                    <v-icon icon="mdi-phone" class="mr-2" size="16" />
                                    <a :href="`tel:${phoneNumber}`" class="footer-inline-link no-underline transition-colors duration-300 hover:underline">
                                        {{ phoneNumber }}
                                    </a>
                                </p>
                                <!-- <p class="text-white/80 text-sm flex items-center mb-2">
                                    <v-icon icon="mdi-email" class="mr-2" size="16"></v-icon>
                                    <a href="mailto:#" class="text-white/90 no-underline transition-colors duration-300 hover:text-white hover:underline">
                                        #
                                    </a>
                                </p>
                                <p class="text-white/80 text-sm flex items-center">
                                    <v-icon icon="mdi-web" class="mr-2" size="16"></v-icon>
                                    <a href="https://www.uns.ac.rs" target="_blank" class="text-white/90 no-underline transition-colors duration-300 hover:text-white hover:underline">
                                        www.uns.ac.rs
                                    </a>
                                </p> -->
                                <div class="mt-4">
                                    <v-btn
                                        class="footer-contact-btn"
                                        :color="theme === 'light' ? '#1d4ed8' : 'white'"
                                        variant="tonal"
                                        :prepend-icon="theme === 'light' ? 'mdi-email-outline' : undefined"
                                        :to="'/' + $i18n.locale + '/contact'">
                                        {{ $t('contactLabel') }}
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="footer-rule">
                        <div class="footer-rule flex flex-col md:flex-row justify-between items-center py-4">
                            <div class="footer-copyright mb-2 md:mb-0">
                                <p class="footer-subtle text-sm">
                                    © {{ new Date().getFullYear() }} Sci2Zero. {{ $t('footer.allRightsReserved') }}.
                                </p>
                            </div>
                            <div class="footer-subtle">
                                <version-link />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import VersionLink from './VersionLink.vue';
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { usePublicConfigurationStore } from '@/stores/publicConfigurationStore';
import { useBrandingInformation } from '@/composables/useBrandingInformation';

withDefaults(defineProps<{
    theme?: "dark" | "light";
}>(), {
    theme: "dark",
});

const i18n = useI18n();
const publicConfigurationStore = usePublicConfigurationStore();
const homeLabel = computed(() => i18n.t("homeLabel"));
const personListLabel = computed(() => i18n.t("personListLabel"));
const ouListLabel = computed(() => i18n.t("ouListLabel"));
const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));
const projectsLabel = computed(() => i18n.t("projectsLabel"));
const simpleSearchLabel = computed(() => i18n.t("simpleSearchLabel"));

const logoUrl = computed(() => publicConfigurationStore.logoDisplayUrl);
const hasCustomLogo = computed(() => publicConfigurationStore.hasCustomLogo);
const localizedTitle = computed(() => returnCurrentLocaleContent(publicConfigurationStore.title) || "TeslaRIS");
const localizedDescription = computed(() => returnCurrentLocaleContent(publicConfigurationStore.description) || "");
const { phoneNumber, formattedAddress } = useBrandingInformation();

const quickLinks = ref([
    { title: homeLabel, path: "" },
    { title: personListLabel, path: "persons" },
    { title: ouListLabel, path: "organisation-units" },
    { title: scientificResultsListLabel, path: "scientific-results" },
    { title: projectsLabel, path: "project" },
    { title: simpleSearchLabel, path: "advanced-search" }
]);

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

.footer-title,
.footer-heading {
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.footer-body {
    color: rgba(255, 255, 255, 0.9);
}

.footer-muted,
.footer-link,
.footer-subtle {
    color: rgba(255, 255, 255, 0.8);
}

.footer-link:hover {
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.footer-inline-link {
    color: rgba(255, 255, 255, 0.9);
}

.footer-inline-link:hover {
    color: #ffffff;
}

.footer-rule {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-section--light {
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    color: #334155;
}

.footer-section--light::before {
    content: none;
}

.footer-section--light .footer-title,
.footer-section--light .footer-heading {
    color: #0f172a;
    text-shadow: none;
}

.footer-section--light .footer-body,
.footer-section--light .footer-muted,
.footer-section--light .footer-link {
    color: #64748b;
}

.footer-section--light .footer-link:hover {
    color: #0f172a;
    text-shadow: none;
}

.footer-section--light .footer-inline-link {
    color: #334155;
}

.footer-section--light .footer-inline-link:hover {
    color: #0f172a;
}

.footer-section--light .footer-subtle {
    color: #94a3b8;
}

.footer-section--light .footer-rule {
    border-top-color: #e2e8f0;
}

.footer-section--light :deep(.footer-contact-btn) {
    background: #e8f1fe !important;
    color: #1e3a8a !important;
    border-radius: 0.75rem;
    box-shadow: none;
    text-transform: none;
    letter-spacing: normal;
}

.footer-section--light :deep(.footer-contact-btn .v-icon) {
    color: #1e3a8a !important;
}

</style>
