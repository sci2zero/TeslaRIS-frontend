<template>
    <v-container>
        <h1>{{ $t("simpleSearchLabel") }}</h1>
        <br />
        <br />
        <v-tabs
            v-model="searchTab"
            bg-color="blue-grey-lighten-5"
            color="deep-purple-accent-4"
            align-tabs="center"
        >
            <v-tab value="simpleSearch">
                {{ $t("simpleSearchLabel") }}
            </v-tab>
            <v-tab value="advancedSearch">
                {{ $t("advancedSearchLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="searchTab">
            <v-tabs-window-item value="simpleSearch">
                <search-bar-component
                    ref="simpleSearchRef"
                    class="mt-5"
                    :preset-search-input="simpleSearchPresetInput"
                    focus-automatically
                    @search="clearSortAndPerformSearch"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="advancedSearch">
                <query-input-component
                    ref="queryInputRef"
                    :search-fields="getSearchFieldsForTable()"
                    :preset-search-input="advancedSearchPresetInput"
                    @search="clearSortAndPerformSearch($event)"
                    @reset="resetFiltersAndSearch">
                </query-input-component>
            </v-tabs-window-item>
        </v-tabs-window>

        <v-card class="mt-15">
            <v-tabs
                v-model="currentTab"
                bg-color="blue-grey-lighten-5"
                color="deep-purple-accent-4"
                align-tabs="center"
            >
                <v-tab value="persons" @click="search(searchParams)">
                    {{ $t("personListLabel") }}
                </v-tab>
                <v-tab value="organisationUnits" @click="search(searchParams)">
                    {{ $t("ouListLabel") }}
                </v-tab>
                <v-tab value="publications" @click="search(searchParams)">
                    {{ $t("scientificResultsListLabel") }}
                </v-tab>
            </v-tabs>
  
            <v-card-text>
                <v-window v-model="currentTab">
                    <v-window-item value="persons" eager>
                        <person-table-component
                            ref="parsonTableRef"
                            :persons="persons"
                            :total-persons="totalPersons"
                            enable-export
                            :endpoint-type="currentTab === 'simpleSearch' ? ExportableEndpointType.PERSON_SEARCH : ExportableEndpointType.PERSON_SEARCH_ADVANCED"
                            :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
                            @switch-page="switchPage">
                        </person-table-component>
                    </v-window-item>
  
                    <v-window-item value="organisationUnits" eager>
                        <organisation-unit-table-component
                            ref="ouTableRef"
                            :organisation-units="organisationUnits"
                            :total-o-us="totalOUs"
                            enable-export
                            :endpoint-type="currentTab === 'simpleSearch' ? ExportableEndpointType.ORGANISATION_UNIT_SEARCH : ExportableEndpointType.ORGANISATION_UNIT_SEARCH_ADVANCED"
                            :endpoint-token-parameters="[searchParams, 'null']"
                            @switch-page="switchPage">
                        </organisation-unit-table-component>
                    </v-window-item>
  
                    <v-window-item value="publications" eager>
                        <publication-table-component
                            ref="docTableRef"
                            :publications="publications"
                            :total-publications="totalPublications"
                            enable-export
                            :endpoint-type="currentTab === 'simpleSearch' ? ExportableEndpointType.DOCUMENT_SEARCH : ExportableEndpointType.DOCUMENT_ADVANCED_SEARCH"
                            :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
                            :endpoint-body-parameters="
                                {
                                    allowedTypes: [],
                                    institutionId: null,
                                    commissionId: null
                                }"
                            @switch-page="switchPage">
                        </publication-table-component>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { ref, watch } from "vue";
import { defineComponent } from "vue";
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import OrganisationUnitTableComponent from '@/components/organisationUnit/OrganisationUnitTableComponent.vue';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { OrganisationUnitIndex } from "@/models/OrganisationUnitModel";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import PersonService from "@/services/PersonService";
import type { PersonIndex } from "@/models/PersonModel";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ExportableEndpointType, type SearchFieldsResponse } from "@/models/Common";
import QueryInputComponent from "@/components/core/QueryInputComponent.vue";


export default defineComponent({
    name: "AdvancedSearchVuew",
    components: { SearchBarComponent, OrganisationUnitTableComponent, PersonTableComponent, PublicationTableComponent, QueryInputComponent },
    setup() {
        const i18n = useI18n();
        const route = useRoute();
        const router = useRouter();
        const currentTab = ref("persons");
        const searchTab = ref((route.query.search as string) ? (route.query.search as string) + "Search" : "simpleSearch");

        const searchParams = ref("");
        const simpleSearchPresetInput = ref();
        const advancedSearchPresetInput = ref();

        const organisationUnits = ref<OrganisationUnitIndex[]>([]);
        const persons = ref<PersonIndex[]>([]);
        const publications = ref<DocumentPublicationIndex[]>([]);

        const totalOUs = ref(0);
        const totalPersons = ref(0);
        const totalPublications = ref(0);
        
        const page = ref(0);
        const size = ref(1);

        const sortPerson = ref("");
        const sortOU = ref("");
        const sortPublication = ref("");
        const direction = ref("");

        const parsonTableRef = ref<typeof PersonTableComponent>();
        const ouTableRef = ref<typeof OrganisationUnitTableComponent>();
        const docTableRef = ref<typeof PublicationTableComponent>();

        const personSearchFields = ref<SearchFieldsResponse[]>([]);
        const ouSearchFields = ref<SearchFieldsResponse[]>([]);
        const documentSearchFields = ref<SearchFieldsResponse[]>([]);

        const simpleSearchRef = ref<typeof SearchBarComponent>();
        const queryInputRef = ref<typeof QueryInputComponent>();

        onMounted(async () => {
            currentTab.value = route.query.tab as string;
            document.title = i18n.t("simpleSearchLabel");

            const [personResponse, ouResponse, documentResponse] = await Promise.all([
                PersonService.getSearchFields(false),
                OrganisationUnitService.getSearchFields(false),
                DocumentPublicationService.getSearchFields(false)
            ]);

            personSearchFields.value = personResponse.data;
            ouSearchFields.value = ouResponse.data;
            documentSearchFields.value = documentResponse.data;

            await router.isReady();
            const presetSearchInput = route.query.searchQuery ? route.query.searchQuery as string : "";

            if ((route.query.search as string) === "simple") {
                simpleSearchPresetInput.value = presetSearchInput;
            } else if ((route.query.search as string) === "advanced") {
                searchTab.value = "advancedSearch";
                advancedSearchPresetInput.value = presetSearchInput;
            }
        });

        watch(currentTab, () => {
            if (searchTab.value === "advancedSearch") {
                resetFiltersAndSearch();
                queryInputRef.value?.resetQuery();
            }
        });

        watch(searchTab, () => {
            simpleSearchRef.value?.clearInput();
            queryInputRef.value?.resetQuery();

            router.replace(
                {
                    name:"advancedSearch",
                    query: { 
                        searchQuery: "",
                        tab: currentTab.value,
                        search: searchTab.value === "simpleSearch" ? "simple" : "advanced"
                    }
                }
            );
            resetFiltersAndSearch();
        });

        const searchHandlers = {
            "persons": {
                simple: (params: string) => 
                    PersonService.searchResearchers(params, false, null),
                advanced: (params: string) => 
                    PersonService.searchResearchersAdvanced(params)
            },
            "organisationUnits": {
                simple: (params: string) => 
                    OrganisationUnitService.searchOUs(params, null, null),
                advanced: (params: string) => 
                    OrganisationUnitService.searchOUsAdvanced(params)
            },
            "publications": {
                simple: (params: string) => 
                    DocumentPublicationService.searchDocumentPublications(params, null, false, []),
                advanced: (params: string) => 
                    DocumentPublicationService.performAdvancedSearch(params, null, false, [])
            }
        };

        const resultHandlers = {
            persons: (response: any) => {
                persons.value = response.data.content;
                totalPersons.value = response.data.totalElements;
            },
            organisationUnits: (response: any) => {
                organisationUnits.value = response.data.content;
                totalOUs.value = response.data.totalElements;
            },
            publications: (response: any) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            }
        };
    
        const search = (tokenParams: string) => {
            tokenParams = decodeURIComponent(tokenParams);

            const isSimpleSearch = searchTab.value === "simpleSearch";

            if (!tokenParams || !tokenParams.includes("tokens")) {
                return;
            }

            if (!currentTab.value) {
                currentTab.value = "persons";
            }
            
            if(tokenParams) {
                searchParams.value = tokenParams;
                router.replace(
                    {
                        name:"advancedSearch",
                        query: { 
                            searchQuery: tokenParams.replaceAll("&tokens=", "tokens=").split("tokens=").filter(el => el).join(isSimpleSearch ? " " : "§"),
                            tab: currentTab.value,
                            search: isSimpleSearch ? "simple" : "advanced"
                        }
                    }
                );
            }
            
            const buildParams = () => 
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${getSortField()},${direction.value}`;

                const getSortField = () => {
                    switch(currentTab.value) {
                        case "persons": return sortPerson.value;
                        case "organisationUnits": return sortOU.value;
                        case "publications": return sortPublication.value;
                        default: return "id";
                    }
            };

            const searchType = isSimpleSearch ? "simple" : "advanced";
            const params = buildParams();

            searchHandlers[currentTab.value as keyof typeof searchHandlers][searchType](params)
                .then(resultHandlers[currentTab.value as keyof typeof resultHandlers]);
        };

        const clearSortAndPerformSearch = (tokenParams: string | string[]) => {
            if (typeof tokenParams !== "string") {
                tokenParams = "tokens=" + tokenParams.join("&tokens=");
            }

            parsonTableRef.value?.setSortAndPageOption([], 1);
            ouTableRef.value?.setSortAndPageOption([], 1);
            docTableRef.value?.setSortAndPageOption([], 1);
            
            page.value = 0;

            sortPerson.value = "";
            sortOU.value = "";
            sortPublication.value = "";
            
            direction.value = "";
            search(tokenParams);
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            direction.value = sortDir;
            switch(currentTab.value) {
                case "persons":
                    sortPerson.value = sortField;
                    break;
                case "organisationUnits":
                    sortOU.value = sortField;
                    break;
                case "publications":
                    sortPublication.value = sortField;
                    break;
            }
            search(searchParams.value as string);
        };

        const getSearchFieldsForTable = (): SearchFieldsResponse[] => {
            switch(currentTab.value) {
                case "persons":
                    return personSearchFields.value;
                case "organisationUnits":
                    return ouSearchFields.value;
                case "publications":
                    return documentSearchFields.value;
            }

            return [];
        };

        const resetFiltersAndSearch = () => {
            clearSortAndPerformSearch("tokens=*");
        };

        return {
            currentTab, persons, organisationUnits,
            publications, totalPersons, totalOUs,
            totalPublications, search, switchPage,
            searchParams, ExportableEndpointType,
            clearSortAndPerformSearch, ouTableRef,
            parsonTableRef, docTableRef, searchTab,
            getSearchFieldsForTable, simpleSearchRef,
            resetFiltersAndSearch, queryInputRef,
            simpleSearchPresetInput,
            advancedSearchPresetInput
        };
    }
});
</script>
