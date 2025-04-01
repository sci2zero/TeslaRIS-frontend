<template>
    <h1 class="d-flex flex-row justify-center mb-10">
        {{ $t("routeLabel.thesisLibrarySearch") }}
    </h1>
    
    <v-tabs
        v-model="currentTab"
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

    <v-tabs-window v-model="currentTab">
        <v-tabs-window-item value="simpleSearch">
            <search-bar-component class="mt-4" @search="clearSortAndPerformSearch($event)"></search-bar-component>
        </v-tabs-window-item>
        <v-tabs-window-item value="advancedSearch">
            <query-input-component @search="clearSortAndPerformSearch($event)"></query-input-component>
        </v-tabs-window-item>
    </v-tabs-window>

    <filter-bar-component ref="filtersRef" :filter-component="ThesisFilters"></filter-bar-component>

    <v-row class="d-flex flex-row justify-center mt-15">
        <v-col cols="12" sm="10">
            <publication-table-component
                ref="tableRef"
                class="mt-15"
                :publications="theses"
                :total-publications="totalTheses"
                show-other-formats
                @switch-page="switchPage">
            </publication-table-component>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { getThesisTitleFromValueAutoLocale, getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { type DocumentPublicationIndex, ThesisType } from '@/models/PublicationModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { type ThesisSearchRequest, type ThesisReportRequest } from '@/models/ThesisLibraryModel';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import QueryInputComponent from '@/components/core/QueryInputComponent.vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import ThesisLibrarySearchService from '@/services/thesisLibrary/ThesisLibrarySearchService';
import FilterBarComponent from '@/components/core/FilterBarComponent.vue';
import ThesisFilters from '@/components/thesisLibrary/ThesisFilters.vue';


export default defineComponent({
    name: "ThesisLibrarySearchView",
    components: { SearchBarComponent, QueryInputComponent, PublicationTableComponent, FilterBarComponent },
    setup() {
        const currentTab = ref("simpleSearch");
        const filtersRef = ref<typeof FilterBarComponent>();

        const isFormValid = ref(false);
        const reportRequest = ref<ThesisReportRequest>();
        const i18n = useI18n();

        const tableRef = ref<typeof PublicationTableComponent>();
        const searchParams = ref<string[]>([]);
        const theses = ref<DocumentPublicationIndex[]>([]);
        const totalTheses = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const thesisTypes = computed(() => getThesisTypesForGivenLocale());
        const selectedThesisType = ref<{title: string, value: ThesisType}>({title: getThesisTitleFromValueAutoLocale(ThesisType.PHD) as string, value: ThesisType.PHD});
        const selectedOUs = ref<{title: string, value: number}[]>([]);
        const dateFrom = ref("");
        const dateTo = ref("");

        const { requiredSelectionRules } = useValidationUtils();

        onMounted(() => {
            document.title = i18n.t("routeLabel.thesisLibrarySearch");
        });

        const generateReportRequest = () => {
            reportRequest.value = {
                fromDate: dateFrom.value,
                toDate: dateTo.value,
                thesisType: selectedThesisType.value.value,
                topLevelInstitutionIds: selectedOUs.value.map(selectedOU => selectedOU.value)
            };
        };

        const search = (tokenParams: string[]) => {
            searchParams.value = tokenParams;
            let searchRequest: ThesisSearchRequest = filtersRef.value?.getFilterValues();
            
            if (searchRequest) {
                searchRequest.tokens = tokenParams;
            } else {
                searchRequest = {
                    tokens: tokenParams,
                    advisorIds: [],
                    authorIds: [],
                    boardMemberIds: [],
                    boardPresidentIds: [],
                    facultyIds: [],
                    dateFrom: "",
                    dateTo: "",
                    showOnlyOpenAccess: false,
                    thesisTypes: []
                };
            }
            
            console.log(searchRequest);

            if (currentTab.value === "simpleSearch") {
                ThesisLibrarySearchService.performSimpleSearch(
                    searchRequest,
                    `&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
                .then((response) => {
                    theses.value = response.data.content;
                    totalTheses.value = response.data.totalElements;
                });
            }   else {
                ThesisLibrarySearchService.performAdvancedSearch(
                    searchRequest,
                    `&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
                .then((response) => {
                    theses.value = response.data.content;
                    totalTheses.value = response.data.totalElements;
                });
            }
        };

        const clearSortAndPerformSearch = (tokenParams: string | string[]) => {
            if (typeof tokenParams === "string") {
                tokenParams = tokenParams.replaceAll("tokens=", "").split("&");
            }

            tableRef.value?.setSortAndPageOption([], 1);
            page.value = 0;
            sort.value = "";
            direction.value = "";
            search(tokenParams as string[]);
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        };

        return {
            isFormValid, thesisTypes,
            selectedThesisType,
            requiredSelectionRules,
            selectedOUs, dateFrom,
            dateTo, reportRequest,
            generateReportRequest,
            currentTab, tableRef,
            clearSortAndPerformSearch,
            theses, totalTheses,
            switchPage, ThesisFilters,
            filtersRef
        };
    }
});
</script>
