<template>
    <div>
        <v-container>
            <v-row class="mt-10 mb-10">
                <v-col cols="12" class="text-center">
                    <search-bar-component
                        :search-when-typing="false"
                        @search="search">
                    </search-bar-component>
                </v-col>
            </v-row>
        </v-container>
        <v-row class="py-5">
            <v-col cols="12">
                <v-card flat class="pa-4 header-card">
                    <v-card-title class="text-center">
                        <v-container>
                            <h2>{{ returnCurrentLocaleContent(title) }}</h2>
                            <p class="text-wrap">
                                {{ returnCurrentLocaleContent(description) }}
                            </p>
                        </v-container>
                    </v-card-title>
                </v-card>
            </v-col>
        </v-row>
        <v-container>
            <v-row class="stats-cards">
                <!-- Cards -->
                <v-col v-for="(item, index) in cardsData" :key="index" cols="4" class="my-10">
                    <v-card :to="item.path !== undefined ? '/' + $i18n.locale + '/' + item.path : undefined">
                        <v-card-title class="text-center">
                            {{ item.name }}
                        </v-card-title>

                        <v-card-text class="text-center">
                            <div>
                                <span class="big-number">
                                    {{ item.value }}
                                </span>
                            </div>

                            <v-list v-if="item.topResults?.length > 0" density="compact" class="text-center mt-2">
                                <v-list-subheader class="d-flex flex-row justify-center">
                                    {{ item.topResultsTitle }}
                                </v-list-subheader>
                                <v-list-item
                                    v-for="(subItem, idx) in item.topResults"
                                    :key="idx"
                                    @click.prevent="navigateToItemPage(subItem.item)"
                                >
                                    <v-list-item-title style="white-space: normal; word-wrap: break-word;">
                                        {{ idx + 1 }}. {{ getItemName(subItem.item) }} ({{ subItem.value }})
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
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
import { type PersonIndex } from "@/models/PersonModel";
import { type OrganisationUnitIndex } from "@/models/OrganisationUnitModel";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";
import GlobalLeaderboardService from "@/services/visualization/GlobalLeaderboardService";
import { getDocumentLandingPageName } from "@/utils/PathResolutionUtil";


export default defineComponent({
    name: "HomeView",
    components: { SearchBarComponent },
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

        const topResearchers = ref<{item: PersonIndex, value: number}[]>([]);
        const topInstitutions = ref<{item: OrganisationUnitIndex, value: number}[]>([]);
        const topPublications = ref<{item: DocumentPublicationIndex, value: number}[]>([]);

        onMounted(() => {
            BrandingService.fetchBrandingInfo().then((response) => {
                title.value = response.data.title;
                description.value = response.data.description;
            });

            PersonService.getResearcherCount().then((response) => researcherCount.value = response.data);
            OrganisationUnitService.getOUCount().then((response) => ouCount.value = response.data);
            DocumentPublicationService.getDocumentCount().then((response) => publicationCount.value = response.data);

            GlobalLeaderboardService.getTopCitedResearchersLeaderboard()
                .then((response) => topResearchers.value = response.data
                    .map(le => {
                        return {item: le.a as PersonIndex, value: le.b};
                    })
                );
            
            GlobalLeaderboardService.getTopCitedInstitutionsLeaderboard()
                .then((response) => topInstitutions.value = response.data
                    .map(le => {
                        return {item: le.a as OrganisationUnitIndex, value: le.b};
                    })
                );

            GlobalLeaderboardService.getTopCitedDocumentsLeaderboard()
                .then((response) => topPublications.value = response.data
                    .map(le => {
                        return {item: le.a as DocumentPublicationIndex, value: le.b};
                    })
                );

            document.title = `TeslaRIS - ${i18n.t("homeLabel")}`;
        });

        const mostCitedResearchersLabel = computed(() => i18n.t("mostCitedResearchersLabel"));
        const mostCitedInstitutionsLabel = computed(() => i18n.t("mostCitedInstitutionsLabel"));
        const mostCitedPublicationsLabel = computed(() => i18n.t("mostCitedPublicationsLabel"));

        const cardsData = ref([
            {name: personListLabel, value: researcherCount, topResultsTitle: mostCitedResearchersLabel, topResults: topResearchers, path:'persons'},
            {name: ouListLabel, value: ouCount, topResultsTitle: mostCitedInstitutionsLabel, topResults: topInstitutions, path: 'organisation-units'},
            {name: scientificResultsListLabel, value: publicationCount, topResultsTitle: mostCitedPublicationsLabel, topResults: topPublications, path:'scientific-results'},
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

        return {
            search, cardsData,
            title, description,
            returnCurrentLocaleContent,
            navigateToItemPage,
            getItemName
        };
    },
});
</script>

<style>
    .big-number {
        font-size: 5em;
        line-height: normal;
        font-weight: bold;
        padding: 20px;

        display: inline-block;
        text-align: center;
        color: #272727
    }

    .stats-cards > :nth-child(1) .big-number {
        background: linear-gradient(0deg, hsla(186, 100%, 69%, 1) 0%, hsla(186, 100%, 69%, 0) 100%);
    }

    .stats-cards > :nth-child(2) .big-number {
        background: linear-gradient(0deg, hsla(152, 100%, 50%, 1) 0%, hsla(152, 100%, 50%, 0) 100%);
    }

    .stats-cards > :nth-child(3) .big-number {
        background: linear-gradient(0deg, hsla(35.34deg 100% 73.53%) 0%, hsla(186, 100%, 69%, 0) 100%);
    }

    .header-card {
        background: #2e868f;
        color: white;

        p {
            margin-top: 10px;
            line-height: 20px;
        }
    }
</style>