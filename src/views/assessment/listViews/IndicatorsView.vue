<template>
    <v-container>
        <h1>{{ $t("indicatorListLabel") }}</h1>
        <br />
        <br />
        <br />
        <indicator-table-component :indicators="indicators" :total-indicators="totalIndicators" @switch-page="switchPage"></indicator-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IndicatorService from '@/services/assessment/IndicatorService';
import { ref } from 'vue';
import type { IndicatorResponse } from '@/models/AssessmentModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import IndicatorTableComponent from '@/components/assessment/indicators/IndicatorTableComponent.vue';
import type { Page } from '@/models/Common';
import type { AxiosResponse } from 'axios';


export default defineComponent({
    name: "IndicatorListView",
    components: { IndicatorTableComponent },
    setup() {
        const indicators = ref<IndicatorResponse[]>([]);
        const totalIndicators = ref(0);
        const page = ref(0);
        const size = ref(25);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("indicatorListLabel");
        });

        const search = () => {
            IndicatorService.fetchAllIndicators(`page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response: AxiosResponse<Page<IndicatorResponse>>) => {
                indicators.value = response.data.content;
                totalIndicators.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search();
        }

        return {search, indicators, totalIndicators, switchPage};
    }
});
</script>
