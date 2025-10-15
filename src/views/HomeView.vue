<template>
    <div>
        <!-- Hero section with background image covering navbar and content -->
        <div class="hero-section-bg">
            <Navbar variant="home" />
            <div class="py-16">
                <div class="text-center text-white hero-text-container">
                    <div class="container mx-auto px-4">
                        <h2 class="hero-title">
                            {{ returnCurrentLocaleContent(title) }}
                        </h2>
                        <p class="text-base md:text-lg lg:text-xl px-3 md:px-6 lg:px-8  max-w-4xl text-justify mx-auto font-normal text-white text-shadow-sm leading-relaxed">
                            {{ returnCurrentLocaleContent(description) }}
                        </p>
                    </div>
                </div>
                <div class="container mx-auto px-4 pt-10">
                    <div class="mt-10 mb-10">
                        <div class="text-center">
                            <!-- Search bar -->
                            <div class="flex justify-center">
                                <search-bar-component :dark="true" :search-when-typing="false" @search="search"></search-bar-component>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="max-w-5xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 py-8 pb-12 px-8">
                    <!-- Cards -->
                    <div v-for="(item, index) in cardsData" :key="index" class="">
                        <div
                            class="frosted-glass-card cursor-pointer hover:scale-105 transition-all duration-300"
                            @click="item.path !== undefined ? $router.push('/' + $i18n.locale + '/' + item.path) : undefined">
                            <div class="text-center mb-3 sm:mb-4">
                                <div class="icon-wrapper">
                                    <v-icon :icon="item.icon" class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" :size="$vuetify.display.xs ? '32' : $vuetify.display.sm ? '40' : '48'"></v-icon>
                                </div>
                            </div>
                            <h3 class="text-center text-sm sm:text-base font-medium mb-2 sm:mb-3 text-white px-2">
                                {{ item.name }}
                            </h3>
                            <div class="text-center">
                                <div v-if="isLoadingCounts">
                                    <v-progress-circular
                                        indeterminate
                                        color="white"
                                        :size="40"
                                        :width="3"
                                    ></v-progress-circular>
                                </div>
                                <div v-else>
                                    <span class="frosted-number text-lg sm:text-xl md:text-2xl">
                                        {{ item.value }}
                                    </span>
                                </div>
                            </div>
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

        const personListLabel = computed(() => i18n.t("personListLabel"));
        const ouListLabel = computed(() => i18n.t("ouListLabel"));
        const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));

        const researcherCount = ref(0);
        const ouCount = ref(0);
        const publicationCount = ref(0);
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
    ])

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

            console.log(item as DocumentPublicationIndex)
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

        return {
            search, cardsData,
            title, description,
            returnCurrentLocaleContent,
            router,
            navigateToItemPage,
            getItemName,
            isLoadingCounts
        };
    },
});
</script>

<style>
@reference "@/assets/main.css";

.hero-section-bg {
    background-image: url('/NTP_Novi_Sad_zgrada_6.jpeg');
    background-size: cover;
    background-position: top;
    background-repeat: no-repeat;
    position: relative;
    padding: 0;
}

.hero-section-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: brightness(0.5);
    background: linear-gradient(to bottom,
            rgb(51 87 143 / 82%) 0%,
            rgba(54, 94, 226, 0.2) 15%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.6) 80%,
            rgba(0, 0, 0, 0.7) 100%);
    z-index: 1;
}

.hero-section-bg>* {
    position: relative;
    z-index: 2;
}

.frosted-glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.frosted-number {
    font-size: 2.5em;
    line-height: normal;
    font-weight: bold;
    padding: 12px;
    display: inline-block;
    text-align: center;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 8px;
}

.icon-wrapper svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Hero Text Styling */
.hero-text-container {
    position: relative;
    z-index: 3;
}

.hero-title {
    @apply text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight;
    font-family: 'Libre Baskerville', serif; 
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}



</style>