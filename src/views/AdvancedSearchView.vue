<template>
    <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header class="mb-6">
            <h1 class="text-3xl font-bold tracking-tight text-slate-800">
                {{ $t("simpleSearchLabel") }}
            </h1>
            <p class="mt-2 max-w-2xl text-base text-slate-500">
                {{ $t("searchPageHint") }}
            </p>
        </header>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div class="mb-5 inline-flex rounded-lg bg-slate-100 p-1">
                <button
                    type="button"
                    class="rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    :class="searchTab === 'simpleSearch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                    @click="searchTab = 'simpleSearch'"
                >
                    {{ $t("simpleSearchLabel") }}
                </button>
                <button
                    type="button"
                    class="rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    :class="searchTab === 'advancedSearch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                    @click="searchTab = 'advancedSearch'"
                >
                    {{ $t("advancedSearchLabel") }}
                </button>
            </div>

            <div v-if="searchTab === 'simpleSearch'" class="flex items-end gap-3">
                <ui-input
                    ref="simpleSearchFieldRef"
                    v-model="simpleSearchInput"
                    class="min-w-0 flex-1"
                    :placeholder="$t('searchBarPlaceholder')"
                    :aria-label="$t('searchBarPlaceholder')"
                    @keydown.enter="runSimpleSearch"
                />
                <ui-button type="button" class="mb-0.5" @click="runSimpleSearch">
                    {{ $t("searchLabel") }}
                </ui-button>
            </div>
            <query-input-component
                v-else
                ref="queryInputRef"
                :search-fields="getSearchFieldsForTable()"
                :preset-search-input="advancedSearchPresetInput"
                @search="clearSortAndPerformSearch($event)"
                @reset="resetFiltersAndSearch"
            />
        </section>

        <section class="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex flex-wrap gap-2 border-b border-slate-200 px-4 pt-4">
                <button
                    v-for="tab in resultTabs"
                    :key="tab.value"
                    type="button"
                    class="border-b-2 px-3 pb-3 text-sm font-medium transition-colors"
                    :class="currentTab === tab.value
                        ? 'border-slate-800 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'"
                    @click="currentTab = tab.value; search(searchParams)"
                >
                    {{ $t(tab.label) }}
                </button>
            </div>

            <div class="p-4 sm:p-5">
                <v-window v-model="currentTab">
                    <v-window-item value="persons" eager>
                        <person-table-component
                            ref="parsonTableRef"
                            :persons="persons"
                            :total-persons="totalPersons"
                            enable-export
                            :endpoint-type="searchTab === 'simpleSearch' ? ExportableEndpointType.PERSON_SEARCH : ExportableEndpointType.PERSON_SEARCH_ADVANCED"
                            :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
                            @switch-page="switchPage"
                        />
                    </v-window-item>

                    <v-window-item value="organisationUnits" eager>
                        <organisation-unit-table-component
                            ref="ouTableRef"
                            :organisation-units="organisationUnits"
                            :total-o-us="totalOUs"
                            enable-export
                            :endpoint-type="searchTab === 'simpleSearch' ? ExportableEndpointType.ORGANISATION_UNIT_SEARCH : ExportableEndpointType.ORGANISATION_UNIT_SEARCH_ADVANCED"
                            :endpoint-token-parameters="[searchParams, 'null']"
                            @switch-page="switchPage"
                        />
                    </v-window-item>

                    <v-window-item value="publications" eager>
                        <publication-table-component
                            ref="docTableRef"
                            :publications="publications"
                            :total-publications="totalPublications"
                            enable-export
                            :endpoint-type="searchTab === 'simpleSearch' ? ExportableEndpointType.DOCUMENT_SEARCH : ExportableEndpointType.DOCUMENT_ADVANCED_SEARCH"
                            :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
                            :endpoint-body-parameters="
                                {
                                    allowedTypes: [],
                                    institutionId: null,
                                    commissionId: null
                                }"
                            @switch-page="switchPage"
                        />
                    </v-window-item>
                </v-window>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { ref, watch, nextTick } from "vue";
import { defineComponent } from "vue";
import lodash from "lodash";
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
import UiInput from "@/components/ui/input/Input.vue";
import { UiButton } from "@/components/ui/button";


export default defineComponent({
    name: "AdvancedSearchVuew",
    components: { OrganisationUnitTableComponent, PersonTableComponent, PublicationTableComponent, QueryInputComponent, UiInput, UiButton },
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

        const simpleSearchInput = ref("");
        const simpleSearchFieldRef = ref<{ focus?: () => void } | null>(null);
        const queryInputRef = ref<typeof QueryInputComponent>();

        const resultTabs = [
            { value: "persons", label: "personListLabel" },
            { value: "organisationUnits", label: "ouListLabel" },
            { value: "publications", label: "scientificResultsListLabel" },
        ];

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

            nextTick(() => simpleSearchFieldRef.value?.focus?.());
        });

        watch(currentTab, () => {
            if (searchTab.value === "advancedSearch") {
                resetFiltersAndSearch();
                queryInputRef.value?.resetQuery();
            }
        });

        watch(searchTab, () => {
            simpleSearchInput.value = "";
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
    
        const runSimpleSearch = () => {
            const raw = simpleSearchInput.value ?? "";
            let tokens: string[] = raw.trim().split(" ");
            if (tokens.length === 1 && tokens[0] === "") {
                tokens = ["*"];
            }

            let params = "";
            let parsingPhrase = false;
            let currentToken = "";
            tokens.forEach(token => {
                if (token === "") {
                    return;
                }

                if (token.startsWith('"')) {
                    parsingPhrase = true;
                } else if (token.endsWith('"')) {
                    parsingPhrase = false;
                }

                currentToken += token;
                if (!parsingPhrase) {
                    params += `tokens=${encodeURIComponent(currentToken)}&`;
                    currentToken = "";
                } else {
                    currentToken += " ";
                }
            });

            clearSortAndPerformSearch(params.slice(0, -1));
        };

        watch(simpleSearchInput, lodash.debounce(() => {
            if (searchTab.value !== "simpleSearch") {
                return;
            }
            runSimpleSearch();
        }, 300));

        watch(simpleSearchPresetInput, () => {
            if (simpleSearchPresetInput.value && simpleSearchPresetInput.value !== "*") {
                simpleSearchInput.value = simpleSearchPresetInput.value;
            }
        });

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
            getSearchFieldsForTable, queryInputRef,
            resetFiltersAndSearch, simpleSearchPresetInput, simpleSearchInput,
            simpleSearchFieldRef, runSimpleSearch,
            advancedSearchPresetInput, resultTabs
        };
    }
});
</script>
