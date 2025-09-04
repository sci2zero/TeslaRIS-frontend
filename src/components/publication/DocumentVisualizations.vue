<template>
    <v-row
        v-if="initialDatesSet"
        class="align-center mt-2"
        style="max-width: 300px;">
        <v-col cols="6">
            <date-picker
                v-model="startDate"
                :label="$t('startDateLabel') + '*'"
                color="primary"
                required
                :allow-deletion="false"
            />
        </v-col>
        <v-col cols="6">
            <date-picker
                v-model="endDate"
                :label="$t('endDateLabel') + '*'"
                color="primary"
                required
                :allow-deletion="false"
            />
        </v-col>
    </v-row>

    <v-tabs
        v-if="documentId"
        v-model="currentTab"
        color="deep-purple-accent-4"
        align-tabs="start"
    >
        <v-tab value="statistics">
            {{ $t("statisticsLabel") }}
        </v-tab>
    </v-tabs>

    <v-tabs-window
        v-if="documentId"
        v-model="currentTab"
    >
        <v-tabs-window-item value="statistics">
            <v-row class="d-flex flex-row text-center mt-10">
                <v-col
                    cols="12" md="6"
                    class="d-flex justify-center align-center">
                    <display-card
                        :display-value="viewsByCountry.reduce((sum, entry) => sum += entry.value, 0)"
                        :label="$t('totalViewsLabel')"
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <simple-bar-chart
                        :data="viewsMonthly"
                        :title="$t('numberOfViewsMonthlyLabel')"
                        :y-label="$t('countLabel')"
                        show-trend-line
                    />
                </v-col>
            </v-row>
            <v-row class="d-flex flex-row text-center mt-10">
                <v-col
                    cols="12" md="6"
                    class="d-flex justify-center align-center">
                    <display-card
                        :display-value="downloadsByCountry.reduce((sum, entry) => sum += entry.value, 0)"
                        :label="$t('totalDownloadsLabel')"
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <simple-bar-chart
                        :data="downloadsMonthly"
                        :title="$t('numberOfDownloadsMonthlyLabel')"
                        :y-label="$t('countLabel')"
                        show-trend-line
                    />
                </v-col>
            </v-row>
            <v-row class="mt-10 d-flex justify-center">
                <v-col cols="12" md="8">
                    <WorldMapChart
                        :data="viewsByCountry"
                        :title="$t('viewsByCountryLabel')"
                        :subtitle="$t('globalTrafficOverviewLabel')"
                        :series-name="$t('totalViewsLabel')"
                        height="600px"
                    />
                </v-col>
            </v-row>
            <v-row class="d-flex flex-row text-center">
                <v-col>
                    <h3
                        v-if="viewsByCountry && viewsByCountry.length > 0">
                        {{ $t("noCountryViews") }}: {{ viewsByCountry.find(entry => entry.countryCode === "N/A")?.value }}
                    </h3>
                </v-col>
            </v-row>
            <v-row class="mt-10 d-flex justify-center">
                <v-col cols="12" md="8">
                    <WorldMapChart
                        :data="downloadsByCountry"
                        :title="$t('downloadsByCountryLabel')"
                        :subtitle="$t('globalTrafficOverviewLabel')"
                        :series-name="$t('totalDownloadsLabel')"
                        height="600px"
                    />
                </v-col>
            </v-row>
            <v-row class="d-flex flex-row text-center">
                <v-col>
                    <h3
                        v-if="downloadsByCountry && downloadsByCountry.length > 0">
                        {{ $t("noCountryDownloads") }}: {{ downloadsByCountry.find(entry => entry.countryCode === "N/A")?.value }}
                    </h3>
                </v-col>
            </v-row>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import { StatisticsType } from '@/models/AssessmentModel';
import DocumentVisualizationService from '@/services/visualization/DocumentVisualizationService';
import { onMounted, ref, watch } from 'vue';
import { type CountryStatisticsData } from '../charts/WorldMapChart.vue';
import SimpleBarChart, { type BarSeries } from '../charts/SimpleBarChart.vue';
import { localiseDate } from '@/utils/DateUtil';
import { useI18n } from 'vue-i18n';
import WorldMapChart from '../charts/WorldMapChart.vue';
import DisplayCard from '../charts/DisplayCard.vue';
import DatePicker from '../core/DatePicker.vue';


const props = defineProps({
    documentId: {
        type: Number,
        required: true
    }
});


const i18n = useI18n();
const currentTab = ref("publicationCount");

const viewsByCountry = ref<CountryStatisticsData[]>([]);
const downloadsByCountry = ref<CountryStatisticsData[]>([]);

const viewsMonthly = ref<{ categories: string[]; series: BarSeries[]; }>();
const downloadsMonthly = ref<{ categories: string[]; series: BarSeries[]; }>();

const initialDatesSet = ref(false);
const startDate = ref<string>("");
const endDate = ref<string>("");

onMounted(() => {
    endDate.value = (new Date()).toISOString().split("T")[0];

    const currentDate = new Date();
    currentDate.setFullYear((new Date()).getFullYear() - 1);
    startDate.value = currentDate.toISOString().split("T")[0];

    initialDatesSet.value = true;
});

watch(currentTab, () => {
    fetchVisualizationsData();
});

watch([startDate, endDate], () => {
    if (!startDate.value || !endDate.value) {
        return;
    }

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    if (end < start) {
        const newStart = end.toISOString();
        const newEnd = start.toISOString();

        startDate.value = newStart;
        endDate.value = newEnd;

        return;
    }

    getDocumentStatistics(
        props.documentId,
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
    );
});

const fetchVisualizationsData = () => {
    if(!props.documentId) {
        return;
    }

    getDocumentStatistics(
            props.documentId,
            startDate.value.split("T")[0],
            endDate.value.split("T")[0]);
};

const getDocumentStatistics = (documentId: number, startDate: string, endDate: string) => {
    DocumentVisualizationService.getDocumentStatisticsByCountry(
        documentId, StatisticsType.VIEW, startDate, endDate
    ).then(response => {
        viewsByCountry.value = response.data;
    });

    DocumentVisualizationService.getDocumentStatisticsByCountry(
        documentId, StatisticsType.DOWNLOAD, startDate, endDate
    ).then(response => {
        downloadsByCountry.value = response.data;
    });

    DocumentVisualizationService.getMonthlyStatisticsForDocument(
        documentId, StatisticsType.VIEW, startDate, endDate
    ).then(response => {
        const categories: string[] = [];
        const series: number[] = [];
        
        setCategoriesAndSeries(response.data, categories, series);

        viewsMonthly.value = {
            categories: categories, series: [
                {name: i18n.t("viewsLabel"), data: series}
            ]
        };
    });

    DocumentVisualizationService.getMonthlyStatisticsForDocument(
        documentId, StatisticsType.DOWNLOAD, startDate, endDate
    ).then(response => {
        const categories: string[] = [];
        const series: number[] = [];

        setCategoriesAndSeries(response.data, categories, series);

        downloadsMonthly.value = {
            categories: categories, series: [
                {name: i18n.t("viewsLabel"), data: series}
            ]
        };
    });
};

const setCategoriesAndSeries = (data: Record<string, number>, categories: string[], series: number[]) => {
    Object.entries(data).forEach(pair => {
        categories.push(localiseDate(pair[0]));
        series.push(pair[1]);
    });
};

</script>
