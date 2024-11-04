<template>
    <v-container>
        <h1>{{ $t("researchAreaListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <br />
        <br />
        <research-area-table-component ref="tableRef" :research-areas="researchAreas" :total-research-areas="totalCountries" @switch-page="switchPage"></research-area-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import ResearchAreaService from '@/services/ResearchAreaService';
import ResearchAreaTableComponent from '@/components/researchArea/ResearchAreaTableComponent.vue';
import { ref } from 'vue';
import type { ResearchAreaResponse } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';


export default defineComponent({
    name: "ResearchAreaListView",
    components: {SearchBarComponent, ResearchAreaTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const researchAreas = ref<ResearchAreaResponse[]>([]);
        const totalCountries = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof ResearchAreaTableComponent>();

        onMounted(() => {
            document.title = i18n.t("researchAreaListLabel");
        });

        const clearSortAndPerformSearch = (tokenParams: string) => {
            tableRef.value?.setSortOption([]);
            search(tokenParams); 
        };

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            ResearchAreaService.searchResearchAreas(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                researchAreas.value = response.data.content;
                totalCountries.value = response.data.totalElements;
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
            search, researchAreas, totalCountries, switchPage,
            clearSortAndPerformSearch, tableRef
        };
    }
});
</script>
