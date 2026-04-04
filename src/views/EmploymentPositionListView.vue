<template>
    <v-container>
        <h1>{{ $t("employmentPositionListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch" />
        <br />
        <br />
        <br />
        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="2"
            layout="table"
        />
        <employment-position-table-component
            v-else
            ref="tableRef"
            :employment-positions="employmentPositions"
            :total-employment-positions="totalCountries"
            @switch-page="switchPage"
        />
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import EmploymentPositionService from '@/services/EmploymentPositionService';
import EmploymentPositionTableComponent from '@/components/core/employmentPosition/EmploymentPositionTableComponent.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { type EmploymentPositionHierarchy } from '@/models/InvolvementModel';


export default defineComponent({
    name: "EmploymentPositionListView",
    components: { SearchBarComponent, EmploymentPositionTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const employmentPositions = ref<EmploymentPositionHierarchy[]>([]);
        const totalCountries = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof EmploymentPositionTableComponent>();

        onMounted(() => {
            document.title = i18n.t("employmentPositionListLabel");
            loading.value = true;
        });

        watch(i18n.locale, () => {
            search(searchParams.value);
        });

        const clearSortAndPerformSearch = (tokenParams: string) => {
            tableRef.value?.setSortAndPageOption([], 1);
            page.value = 0;
            sort.value = "";
            direction.value = "";
            search(tokenParams);
        };

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            EmploymentPositionService.searchEmploymentPositions(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
            .then((response) => {
                employmentPositions.value = response.data.content;
                totalCountries.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        };

        return {
            search, employmentPositions, totalCountries, switchPage,
            clearSortAndPerformSearch, tableRef, loading
        };
    }
});
</script>
