<template>
    <v-row
        v-if="initialDatesSet && currentTab !== 'statistics'"
        no-gutters
        class="align-center mt-2"
        style="max-width: 250px;">
        <v-col cols="5">
            <v-text-field
                v-model="fromYear"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                :label="$t('fromLabel')"
                class="mr-2"
                :min="minYear"
                :max="maxYear"
            ></v-text-field>
        </v-col>

        <v-col cols="5">
            <v-text-field
                v-model="toYear"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                :label="$t('toLabel')"
                :min="minYear"
                :max="maxYear"
            ></v-text-field>
        </v-col>
    </v-row>
    <v-tabs
        v-if="personId"
        v-model="currentTab"
        color="deep-purple-accent-4"
        align-tabs="start"
    >
        <v-tab value="publicationCount">
            {{ $t("numberOfPublicationsLabel") }}
        </v-tab>
        <v-tab value="publicationType">
            {{ $t("publicationTypesLabel") }}
        </v-tab>
        <v-tab value="statistics">
            {{ $t("statisticsLabel") }}
        </v-tab>
    </v-tabs>

    <v-tabs-window
        v-if="personId"
        v-model="currentTab"
    >
        <v-tabs-window-item value="publicationCount">
            <v-row class="mt-10">
                <v-col
                    cols="12" md="6"
                    class="d-flex justify-center align-center">
                    <display-card
                        :display-value="totalPublicationCount"
                        :label="$t('totalPublicationsLabel')"
                    />
                </v-col>
                <v-col cols="12" md="6">
                    <simple-bar-chart
                        :data="publicationsYearData"
                        :title="$t('numberOfPublicationsYearlyLabel')"
                        :y-label="$t('countLabel')"
                    />
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <stacked-bar-chart
                        :data="publicationsYearTypeData"
                        :title="$t('numberOfPublicationsByTypeAndYearLabel')"
                        :y-label="$t('countLabel')"
                    />
                </v-col>
            </v-row>
            <v-row v-for="mCategoryCounts in commissionsYearMCategoryData" :key="mCategoryCounts.commissionName">
                <v-col>
                    <stacked-bar-chart
                        :data="{categories: mCategoryCounts.categories, series: mCategoryCounts.series}"
                        :title="$t('numberOfPublicationsByMCategoryAndYearLabel')"
                        :subtitle="$t('commissionLabel') + ': ' + mCategoryCounts.commissionName"
                        :y-label="$t('countLabel')"
                    />
                </v-col>
            </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="publicationType">
            <v-row class="mt-10 d-flex justify-center">
                <v-col cols="12" md="8">
                    <pie-chart
                        :data="publicationTypeRatioData"
                        :title="$t('publicationTypeRatioLabel')"
                        :donut="true"
                        :show-percentage="true"
                    />
                </v-col>
            </v-row>
            <v-row
                v-for="mCategoryRatio in commissionMCategoryRatios"
                :key="mCategoryRatio.commissionName"
                class="mt-10 d-flex justify-center">
                <v-col cols="12" md="8">
                    <pie-chart
                        :data="mCategoryRatio.data"
                        :title="$t('publicationMCategoryRatioLabel')"
                        :subtitle="$t('commissionLabel') + ': ' + mCategoryRatio.commissionName"
                        :donut="true"
                        :show-percentage="true"
                    />
                </v-col>
            </v-row>
        </v-tabs-window-item>
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
                    <h3>{{ $t("noCountryViews") }}: {{ viewsByCountry.find(entry => entry.countryCode === "N/A")?.value }}</h3>
                </v-col>
            </v-row>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import StackedBarChart, { type StackedBarSeries } from '../charts/StackedBarChart.vue';
import PersonVisualizationService from '@/services/visualization/PersonVisualizationService';
import { MCategory, type YearlyCounts } from '@/models/Common';
import { PublicationType } from '@/models/PublicationModel';
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import PieChart, { type PieDataItem } from '../charts/PieChart.vue';
import SimpleBarChart, { type BarSeries } from '../charts/SimpleBarChart.vue';
import { useI18n } from 'vue-i18n';
import WorldMapChart from '../charts/WorldMapChart.vue';
import type { CountryStatisticsData } from '../charts/WorldMapChart.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import DisplayCard from '../charts/DisplayCard.vue';


const props = defineProps({
    personId: {
        type: Number,
        required: true
    }
});

const publicationsYearTypeData = ref<{ categories: string[]; series: StackedBarSeries[]; }>();
const publicationsYearData = ref<{ categories: string[]; series: BarSeries[]; }>();
const publicationTypeRatioData = ref<PieDataItem[]>([]);
const totalPublicationCount = ref<number>(0);

const viewsMonthly = ref<{ categories: string[]; series: BarSeries[]; }>();
const viewsByCountry = ref<CountryStatisticsData[]>([]);

const commissionMCategoryRatios = ref<{commissionName: string, data: PieDataItem[]}[]>([]);
const commissionsYearMCategoryData = ref<{commissionName: string, categories: string[]; series: StackedBarSeries[]; }[]>([]);

const i18n = useI18n();
const currentTab = ref("publicationCount");

const initialDatesSet = ref(false);
const fromYear = ref(0);
const toYear = ref(0);
const minYear = ref(0);
const maxYear = ref(0);

onMounted(() => {
    getPersonPublicationCounts(props.personId);
    getPersonStatistics(props.personId);
});

watch(currentTab, () => {
    fetchVisualizationsData();
});

const fetchVisualizationsData = () => {
    if(!props.personId) {
        return;
    }

    if (currentTab.value !== "statistics" && totalPublicationCount.value === 0) {
        getPersonPublicationCounts(props.personId);
    } else if (currentTab.value === "statistics" && viewsByCountry.value.length === 0) {
        getPersonStatistics(props.personId);
    }
};

const getPersonPublicationCounts = (personId: number) => {
    PersonVisualizationService.getPersonPublicationCountsByYear(personId)
    .then(async response => {
        const yearlyCounts: YearlyCounts[] = response.data;

        await new Promise(resolve => setTimeout(resolve, 2000));

        const categories = yearlyCounts.map(yc => String(yc.year));

        if(categories.length > 0) {
            minYear.value = parseInt(categories[0]);
            maxYear.value = parseInt(categories[categories.length - 1]);
            initialDatesSet.value = true;
            fromYear.value = minYear.value;
            toYear.value = maxYear.value;
        }

        const typeSeries: any[] = Object.values(PublicationType).map(pubType => ({
            name: getPublicationTypeTitleFromValueAutoLocale(pubType),
            data: yearlyCounts.map(yc => yc.countsByCategory[pubType] ?? 0)
        }));

        const totalSeries = [{
            name: i18n.t("publicationsLabel"),
            data: yearlyCounts.map(yc => 
                Object.values(yc.countsByCategory).reduce((sum, count) => sum + (count ?? 0), 0)
            )
        }];

        publicationTypeRatioData.value = Object.values(PublicationType).map(pubType => {
            const total = yearlyCounts.reduce((sum, yc) => {
                return sum + (yc.countsByCategory[pubType] ?? 0);
            }, 0);

            return {
                name: getPublicationTypeTitleFromValueAutoLocale(pubType) as string,
                value: total
            };
        });


        totalPublicationCount.value = totalSeries.reduce(
            (sum, series) => sum + series.data.reduce((s, v) => s + v, 0), 0
        );

        publicationsYearTypeData.value = { categories, series: typeSeries };
        publicationsYearData.value = { categories, series: totalSeries };

        if (totalPublicationCount.value > 0) {
            getMCategoryCounts(personId);
        }
    });
};

const getPersonStatistics = (personId: number) => {
    PersonVisualizationService.getPersonViewsByCountry(
        personId
    ).then(response => {
        viewsByCountry.value = response.data;
    });

    PersonVisualizationService.getMonthlyViewsForPerson(personId).then(response => {
        const categories: string[] = [];
        const series: number[] = [];
        
        Object.entries(response.data).forEach(pair => {
            categories.push(pair[0]);
            series.push(pair[1]);
        });

        viewsMonthly.value = {
            categories: categories, series: [
                {name: i18n.t("viewsLabel"), data: series}
            ]
        };
    });
};

const getMCategoryCounts = (personId: number) => {
    PersonVisualizationService.getPersonMCategories(personId).then((response) => {
        commissionMCategoryRatios.value.splice(0);
        response.data.forEach(commissionCount => {
            const commissionName = returnCurrentLocaleContent(commissionCount.commissionName) as string;
            const data: PieDataItem[] = [];

            Object.entries(commissionCount.countsByCategory).forEach((pair) => {
                data.push({name: pair[0] === "NONE" ? i18n.t("notClassifiedLabel") : pair[0], value: pair[1]});
            });

            commissionMCategoryRatios.value.push({commissionName: commissionName, data: data });
        });
    });

    PersonVisualizationService.getPersonMCategoryCounts(personId).then((response) => {
        commissionsYearMCategoryData.value.splice(0);
        response.data.forEach(commissionCount => {
            const commissionName = returnCurrentLocaleContent(commissionCount.commissionName) as string;
            const yearlyCounts: YearlyCounts[] = commissionCount.yearlyCounts;

            const categories = yearlyCounts.map(yc => String(yc.year));

            const typeSeries: any[] = Object.values(MCategory).map(mCategory => ({
                name: mCategory === "NONE" ? i18n.t("notClassifiedLabel") : mCategory,
                data: yearlyCounts.map(yc => yc.countsByCategory[mCategory] ?? 0)
            }));

            commissionsYearMCategoryData.value.push({commissionName: commissionName, categories, series: typeSeries });
        });
    });
};

</script>
