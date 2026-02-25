<template>
    <v-container>
        <h1>{{ $t("indicatorListLabel") }}</h1>
        <br />
        <br />
        <br />
        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="1"
            layout="table"
        />
        <indicator-table-component
            v-show="!loading"
            :indicators="indicators"
            :total-indicators="totalIndicators"
            @switch-page="switchPage"
        />
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import IndicatorService from '@/services/assessment/IndicatorService';
import { ref } from 'vue';
import type { IndicatorResponse } from '@/models/AssessmentModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import IndicatorTableComponent from '@/components/assessment/indicators/IndicatorTableComponent.vue';
import type { Page } from '@/models/Common';
import type { AxiosResponse } from 'axios';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "IndicatorListView",
    components: { IndicatorTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);
        
        const indicators = ref<IndicatorResponse[]>([]);
        const totalIndicators = ref(0);
        const page = ref(0);
        const size = ref(25);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("indicatorListLabel");
            loading.value = true;
        });

        watch(i18n.locale, () => {
            search();
        });

        const search = () => {
            IndicatorService.fetchAllIndicators(`page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
            .then((response: AxiosResponse<Page<IndicatorResponse>>) => {
                indicators.value = response.data.content;
                totalIndicators.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            })
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search();
        };

        return {
            search, indicators,
            totalIndicators, switchPage,
            loading
        };
    }
});
</script>
