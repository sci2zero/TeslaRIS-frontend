<template>
    <stacked-bar-chart
        v-if="publicationsData"
        :data="publicationsData"
        :y-label="$t('numberOfPublicationsLabel')"
        :loading="loading"
    />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import StackedBarChart, { type StackedBarSeries } from '../charts/StackedBarChart.vue';
import PersonVisualizationService from '@/services/visualization/PersonVisualizationService';
import type { YearlyCounts } from '@/models/Common';
import { PublicationType } from '@/models/PublicationModel';
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';

const props = defineProps({
    personId: {
        type: Number,
        required: true
    }
});

const publicationsData = ref<{ categories: string[]; series: StackedBarSeries[]; }>();
const loading = ref(false);

onMounted(() => {
    if(props.personId) {
        getPersonPublicationCounts(props.personId);
    }
});

const getPersonPublicationCounts = (personId: number) => {
    loading.value = false;
    PersonVisualizationService.getPersonPublicationCountsByYear(personId)
    .then(response => {
        const yearlyCounts: YearlyCounts[] = response.data;

        const categories = yearlyCounts.map(yc => String(yc.year));

        const series: any[] = Object.values(PublicationType).map(pubType => ({
            name: getPublicationTypeTitleFromValueAutoLocale(pubType),
            data: yearlyCounts.map(yc => yc.countsByCategory[pubType] ?? 0)
        }));

        publicationsData.value = { categories, series };
    })
    .finally(() => {
        loading.value = false;
    });
};

</script>
