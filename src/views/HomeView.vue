<template>
    <div>
        <!-- Hero section with background image covering navbar and content -->
        <div class="hero-section-bg" :class="`theme-${heroTheme}`">
            <Navbar variant="home" :theme="heroTheme" />
            <div class="py-16">
                <div class="text-center hero-text-container">
                    <div class="container mx-auto px-4">
                        <h2 class="hero-title">
                            {{ returnCurrentLocaleContent(title) }}
                        </h2>
                        <p class="hero-description text-base md:text-lg lg:text-xl px-3 md:px-6 lg:px-8 max-w-4xl text-justify mx-auto font-normal leading-relaxed">
                            {{ returnCurrentLocaleContent(description) }}
                        </p>
                    </div>
                </div>
                <div class="container mx-auto px-4 pt-10">
                    <div class="mt-10 mb-10">
                        <div class="text-center">
                            <!-- Search bar -->
                            <div class="flex justify-center">
                                <search-bar-component :dark="heroTheme === 'dark'" :transparent="heroTheme === 'dark'" :search-when-typing="false" @search="search"></search-bar-component>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 py-6 pb-10 px-4 sm:px-6">
                    <!-- Cards -->
                    <div v-for="(item, index) in cardsData" :key="index" class="">
                        <div
                            class="frosted-glass-card transition-all duration-300"
                            :class="item.path !== undefined ? 'cursor-pointer hover:scale-105' : ''"
                            @click="item.path !== undefined ? $router.push('/' + $i18n.locale + '/' + item.path) : undefined">
                            <div class="text-center mb-2">
                                <div class="icon-wrapper">
                                    <v-icon :icon="item.icon" :size="$vuetify.display.xs ? '24' : $vuetify.display.sm ? '28' : '32'"></v-icon>
                                </div>
                            </div>
                            <h3 class="hero-card-label text-center text-xs sm:text-sm font-medium mb-1 px-1 leading-tight">
                                {{ item.name }}
                            </h3>
                            <div class="text-center">
                                <div v-if="isLoadingCounts && item.path !== undefined">
                                    <v-progress-circular
                                        indeterminate
                                        :color="heroTheme === 'dark' ? 'white' : '#320f9b'"
                                        :size="28"
                                        :width="3"
                                    ></v-progress-circular>
                                </div>
                                <div v-else>
                                    <span class="frosted-number">
                                        {{ item.value }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                <div class="frosted-glass-card data-quality-panel">
                    <h3 class="hero-card-title text-lg sm:text-xl font-semibold mb-1">
                        {{ $t('dataQualityLabel') }}
                    </h3>
                    <p class="hero-muted text-sm mb-5">
                        {{ $t('landingDataQuality.description') }}
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                        <div
                            v-for="option in dataQualityOptions"
                            :key="option.titleKey"
                            class="data-quality-option"
                        >
                            <h4 class="hero-card-title text-sm sm:text-base font-semibold mb-1">
                                {{ $t(option.titleKey) }}
                            </h4>
                            <p class="hero-muted text-xs sm:text-sm mb-3 leading-relaxed">
                                {{ $t(option.descriptionKey) }}
                            </p>
                            <span class="data-quality-open">
                                {{ $t('landingDataQuality.open') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <landing-features />
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import SearchBarComponent from "../components/core/SearchBarComponent.vue";
import { computed } from "vue";
import { useRouter } from "vue-router";
import PersonService from "@/services/PersonService";
import { onMounted } from "vue";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import BrandingService from "@/services/BrandingService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import Navbar from "@/components/core/MainNavbar.vue";
import LandingFeatures from "@/components/landing/LandingFeatures.vue";
import { type PersonIndex } from "@/models/PersonModel";
import { type OrganisationUnitIndex } from "@/models/OrganisationUnitModel";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";
import { getDocumentLandingPageName } from "@/utils/PathResolutionUtil";


export default defineComponent({
    name: "HomeView",
    components: { SearchBarComponent, Navbar, LandingFeatures },
    setup() {
        const title = ref();
        const description = ref();

        const router = useRouter();
        const i18n = useI18n();
        const heroTheme = ref<'dark' | 'light'>('light');

        const personListLabel = computed(() => i18n.t("personListLabel"));
        const ouListLabel = computed(() => i18n.t("ouListLabel"));
        const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));
        const activitiesLabel = computed(() => i18n.t("activitiesLabel"));
        const projectsLabel = computed(() => i18n.t("projectsLabel"));
        const fundingsLabel = computed(() => i18n.t("fundingsLabel"));

        const researcherCount = ref(0);
        const ouCount = ref(0);
        const publicationCount = ref(0);
        const activitiesCount = ref(0);
        const projectsCount = ref(0);
        const fundingsCount = ref(0);
        const isLoadingCounts = ref(true);

        onMounted(() => {
            BrandingService.fetchBrandingInfo().then((response) => {
                title.value = response.data.title;
                description.value = response.data.description;
            });

            Promise.all([
                PersonService.getResearcherCount().then((response) => researcherCount.value = response.data),
                OrganisationUnitService.getOUCount().then((response) => ouCount.value = response.data),
                DocumentPublicationService.getDocumentCount().then((response) => publicationCount.value = response.data)
            ]).finally(() => {
                isLoadingCounts.value = false;
            });

            document.title = `TeslaRIS - ${i18n.t("homeLabel")}`;
        });

        const mostCitedResearchersLabel = computed(() => i18n.t("mostCitedResearchersLabel"));
        const mostCitedInstitutionsLabel = computed(() => i18n.t("mostCitedInstitutionsLabel"));
        const mostCitedPublicationsLabel = computed(() => i18n.t("mostCitedPublicationsLabel"));

        const cardsData = ref([
            {name: personListLabel, value: researcherCount, topResultsTitle: mostCitedResearchersLabel, path:'persons', icon: 'mdi-account-group'},
            {name: ouListLabel, value: ouCount, topResultsTitle: mostCitedInstitutionsLabel, path: 'organisation-units', icon: 'mdi-domain'},
            {name: scientificResultsListLabel, value: publicationCount, topResultsTitle: mostCitedPublicationsLabel, path:'scientific-results', icon: 'mdi-file-document-multiple'},
            {name: activitiesLabel, value: activitiesCount, icon: 'mdi-calendar-star'},
            {name: projectsLabel, value: projectsCount, icon: 'mdi-briefcase-variant'},
            {name: fundingsLabel, value: fundingsCount, icon: 'mdi-cash-multiple'},
        ]);

        const search = (tokenParams: string) => {
            let token = tokenParams;
            let prefix = "&tokens="
            while (token.includes(prefix)) {
                token = token.replace(prefix, " ");
            }

            prefix = "tokens="
            while (token.includes(prefix)) {
                token = token.replace(prefix, "");
            }
            
            router.push(
                {
                    name:"advancedSearch",
                    query: {
                        searchQuery: token,
                        tab: "publications",
                        search: "simple" 
                    }
                }
            );     
        };

        const getItemName = (item: PersonIndex | OrganisationUnitIndex | DocumentPublicationIndex): string => {
            if ("name" in item) {
                return (item as PersonIndex).name;
            } else if ("nameSr" in item) {
                return (item as OrganisationUnitIndex).nameSr;
            }

            return (item as DocumentPublicationIndex).apa;
        };

        const navigateToItemPage = (item: PersonIndex | OrganisationUnitIndex | DocumentPublicationIndex) => {
            let pageName;
            if ("name" in item) {
                pageName = "researcherLandingPage";
            } else if ("nameSr" in item) {
                pageName = "organisationUnitLandingPage";
            } else {
                pageName = getDocumentLandingPageName((item as DocumentPublicationIndex).type);
            }

            router.push({ name: pageName, params: {id: item.databaseId} });
        };

        const dataQualityOptions = [
            {
                titleKey: "landingDataQuality.repositoryAnalytics.title",
                descriptionKey: "landingDataQuality.repositoryAnalytics.description",
            },
            {
                titleKey: "landingDataQuality.issueExplorer.title",
                descriptionKey: "landingDataQuality.issueExplorer.description",
            },
        ];

        return {
            search, cardsData,
            title, description,
            returnCurrentLocaleContent,
            router,
            navigateToItemPage,
            getItemName,
            isLoadingCounts,
            dataQualityOptions,
            heroTheme
        };
    },
});
</script>

<style>
@reference "@/assets/main.css";

.hero-section-bg {
    --hero-primary: #ffffff;
    --hero-text: #ffffff;
    --hero-text-muted: rgba(255, 255, 255, 0.8);
    --hero-overlay: linear-gradient(to bottom,
            rgb(51 87 143 / 82%) 0%,
            rgba(54, 94, 226, 0.2) 15%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.6) 80%,
            rgba(0, 0, 0, 0.7) 100%);
    --hero-backdrop: brightness(0.5);
    --hero-card-bg: rgba(255, 255, 255, 0.1);
    --hero-card-border: rgba(255, 255, 255, 0.2);
    --hero-card-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    --hero-icon-bg: rgba(255, 255, 255, 0.15);
    --hero-icon-border: rgba(255, 255, 255, 0.2);
    --hero-icon-filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    --hero-option-bg: rgba(255, 255, 255, 0.08);
    --hero-option-border: rgba(255, 255, 255, 0.18);
    --hero-option-hover-bg: rgba(255, 255, 255, 0.14);
    --hero-option-hover-border: rgba(255, 255, 255, 0.28);
    --hero-open-color: #e2e8f0;
    --hero-number-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    --hero-title-gradient: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%);
    --hero-title-fill: transparent;
    --hero-title-filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));

    background-image: url('/NTP_Novi_Sad_zgrada_6.jpeg');
    background-size: cover;
    background-position: top;
    background-repeat: no-repeat;
    position: relative;
    padding: 0;
    color: var(--hero-text);
}

.hero-section-bg.theme-light {
    --hero-primary: #320f9b;
    --hero-text: #1e293b;
    --hero-text-muted: #64748b;
    --hero-overlay: linear-gradient(to bottom,
            rgba(255, 255, 255, 0.94) 0%,
            rgba(255, 255, 255, 0.88) 45%,
            rgba(255, 255, 255, 0.92) 100%);
    --hero-backdrop: brightness(1.12);
    --hero-card-bg: rgba(255, 255, 255, 0.82);
    --hero-card-border: rgba(50, 15, 155, 0.12);
    --hero-card-shadow: 0 8px 32px rgba(50, 15, 155, 0.08);
    --hero-icon-bg: rgba(50, 15, 155, 0.08);
    --hero-icon-border: rgba(50, 15, 155, 0.14);
    --hero-icon-filter: none;
    --hero-option-bg: rgba(255, 255, 255, 0.72);
    --hero-option-border: rgba(15, 23, 42, 0.08);
    --hero-option-hover-bg: rgba(50, 15, 155, 0.05);
    --hero-option-hover-border: rgba(50, 15, 155, 0.18);
    --hero-open-color: #320f9b;
    --hero-number-shadow: none;
    --hero-title-gradient: none;
    --hero-title-fill: #320f9b;
    --hero-title-filter: none;
}

.hero-section-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: var(--hero-backdrop);
    background: var(--hero-overlay);
    z-index: 1;
}

.hero-section-bg>* {
    position: relative;
    z-index: 2;
}

.frosted-glass-card {
    background: var(--hero-card-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--hero-card-border);
    border-radius: 12px;
    padding: 14px 10px;
    box-shadow: var(--hero-card-shadow);
    height: 100%;
}

.frosted-number {
    font-size: 1.5em;
    line-height: normal;
    font-weight: bold;
    padding: 4px;
    display: inline-block;
    text-align: center;
    color: var(--hero-primary);
    text-shadow: var(--hero-number-shadow);
}

.icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: var(--hero-icon-bg);
    border-radius: 50%;
    backdrop-filter: blur(5px);
    border: 1px solid var(--hero-icon-border);
    margin-bottom: 4px;
    color: var(--hero-primary);
}

.icon-wrapper svg,
.icon-wrapper .v-icon {
    color: var(--hero-primary);
    filter: var(--hero-icon-filter);
}

.data-quality-panel {
    padding: 20px 24px;
}

.data-quality-option {
    background: var(--hero-option-bg);
    border: 1px solid var(--hero-option-border);
    border-radius: 12px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.data-quality-option:hover {
    background: var(--hero-option-hover-bg);
    border-color: var(--hero-option-hover-border);
}

.data-quality-open {
    margin-top: auto;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--hero-open-color);
}

.hero-card-title {
    color: var(--hero-primary);
}

.hero-card-label {
    color: var(--hero-text);
}

.hero-muted,
.hero-description {
    color: var(--hero-text-muted);
}

.hero-text-container {
    position: relative;
    z-index: 3;
}

.hero-title {
    @apply text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight;
    font-family: 'Libre Baskerville', serif;
    background: var(--hero-title-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: var(--hero-title-fill);
    color: var(--hero-title-fill);
    filter: var(--hero-title-filter);
}

.hero-section-bg.theme-light .hero-title {
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
    -webkit-text-fill-color: var(--hero-primary);
    color: var(--hero-primary);
    filter: none;
}

</style>