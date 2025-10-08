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
                :max="min([maxYear, toYear])"
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
                :min="max([minYear, fromYear])"
                :max="maxYear"
            ></v-text-field>
        </v-col>
    </v-row>
    <v-row
        v-else-if="initialDatesSet && currentTab === 'statistics'"
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
        v-if="organisationUnitId"
        v-model="currentTab"
        color="deep-purple-accent-4"
        align-tabs="start"
    >
        <v-tab v-show="displayPublicationsTab" value="publicationCount">
            {{ $t("numberOfPublicationsLabel") }}
        </v-tab>
        <v-tab v-show="displayTypeRatiosTab" value="publicationType">
            {{ $t("publicationTypesLabel") }}
        </v-tab>
        <v-tab v-show="displayStatisticsTab" value="statistics">
            {{ $t("statisticsLabel") }}
        </v-tab>
    </v-tabs>

    <v-tabs-window
        v-if="organisationUnitId"
        v-model="currentTab"
    >
        <v-tabs-window-item value="publicationCount">
            <v-row class="mt-10">
                <v-col
                    v-if="displaySettings?.publicationCountTotal.display"
                    cols="12" :md="displaySettings?.publicationCountTotal.spanWholeRow ? 12 : 6"
                    class="d-flex justify-center align-center">
                    <display-card
                        :display-value="totalPublicationCount"
                        :label="$t('totalPublicationsLabel')"
                    />
                </v-col>
                <v-col
                    v-if="displaySettings?.publicationCountByYear.display"
                    cols="12" :md="displaySettings?.publicationCountByYear.spanWholeRow ? 12 : 6">
                    <simple-bar-chart
                        :data="publicationsYearData"
                        :title="$t('numberOfPublicationsYearlyLabel')"
                        :y-label="$t('countLabel')"
                    />
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    v-if="displaySettings?.publicationTypeByYear.display"
                    cols="12" :md="displaySettings?.publicationTypeByYear.spanWholeRow ? 12 : 6">
                    <stacked-bar-chart
                        :data="publicationsYearTypeData"
                        :title="$t('numberOfPublicationsByTypeAndYearLabel')"
                        :y-label="$t('countLabel')"
                    />
                </v-col>
            </v-row>
            <v-row v-for="mCategoryCounts in commissionsYearMCategoryData" :key="mCategoryCounts.commissionName">
                <v-col
                    v-if="displaySettings?.publicationCategoryByYear.display"
                    cols="12" :md="displaySettings?.publicationCategoryByYear.spanWholeRow ? 12 : 6">
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
                <v-col
                    v-if="displaySettings?.publicationTypeRatio.display"
                    cols="12" :md="displaySettings?.publicationTypeRatio.spanWholeRow ? 8 : 6">
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
                <v-col
                    v-if="displaySettings?.publicationCategoryRatio.display"
                    cols="12" :md="displaySettings?.publicationCategoryRatio.spanWholeRow ? 8 : 6">
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
                    v-if="displaySettings?.viewCountTotal.display"
                    cols="12" :md="displaySettings?.viewCountTotal.spanWholeRow ? 12 : 6"
                    class="d-flex justify-center align-center">
                    <display-card
                        :display-value="viewsByCountry.reduce((sum, entry) => sum += entry.value, 0)"
                        :label="$t('totalViewsLabel')"
                    />
                </v-col>
                <v-col
                    v-if="displaySettings?.viewCountByMonth.display"
                    cols="12" :md="displaySettings?.viewCountByMonth.spanWholeRow ? 8 : 6">
                    <simple-bar-chart
                        :data="viewsMonthly"
                        :title="$t('numberOfViewsMonthlyLabel')"
                        :y-label="$t('countLabel')"
                        show-trend-line
                    />
                </v-col>
            </v-row>
            <v-row class="mt-10 d-flex justify-center">
                <v-col
                    v-if="displaySettings?.viewCountByCountry.display"
                    cols="12" :md="displaySettings?.viewCountByCountry.spanWholeRow ? 8 : 6">
                    <div class="d-block text-center">
                        <WorldMapChart
                            :data="viewsByCountry"
                            :title="$t('viewsByCountryLabel')"
                            :subtitle="$t('globalTrafficOverviewLabel')"
                            :series-name="$t('totalViewsLabel')"
                            height="600px"
                        />
                        <h3
                            v-if="viewsByCountry && viewsByCountry.length > 0">
                            {{ $t("noCountryViews") }}: {{ viewsByCountry.find(entry => entry.countryCode === "N/A")?.value }}
                        </h3>
                    </div>
                </v-col>
            </v-row>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref, watch } from 'vue';
import StackedBarChart, { type StackedBarSeries } from '../charts/StackedBarChart.vue';
import OrganisationUnitVisualizationService from '@/services/visualization/OrganisationUnitVisualizationService';
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
import { max, min } from 'lodash';
import DatePicker from '../core/DatePicker.vue';
import { localiseDate } from '@/utils/DateUtil';
import { type OUChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel';


const props = defineProps({
    organisationUnitId: {
        type: Number,
        required: true
    },
    displaySettings: {
        type: Object as PropType<OUChartDisplaySettings | undefined>,
        required: true
    },
    displayPublicationsTab: {
        type: Boolean,
        required: true
    },
    displayTypeRatiosTab: {
        type: Boolean,
        required: true
    },
    displayStatisticsTab: {
        type: Boolean,
        required: true
    }
});

const publicationsYearTypeData = ref<{ categories: string[]; series: StackedBarSeries[]; }>();
const publicationsYearData = ref<{ categories: string[]; series: BarSeries[]; }>();
const publicationTypeRatioData = ref<PieDataItem[]>([]);
const totalPublicationCount = ref<number>(-1);

const viewsMonthly = ref<{ categories: string[]; series: BarSeries[]; }>();
const viewsByCountry = ref<CountryStatisticsData[]>([]);

const commissionMCategoryRatios = ref<{commissionName: string, data: PieDataItem[]}[]>([]);
const commissionsYearMCategoryData = ref<{commissionName: string, categories: string[]; series: StackedBarSeries[]; }[]>([]);

const i18n = useI18n();
const currentTab = ref("publicationCount");

const initialDatesSet = ref(false);
const watchDates = ref(false);
const fromYear = ref<number>(0);
const toYear = ref<number>(0);
const minYear = ref(0);
const maxYear = ref(0);

const startDate = ref<string>("");
const endDate = ref<string>("");

watch([fromYear, toYear], () => {
    if (watchDates.value) {
        if (fromYear.value < minYear.value) {
            fromYear.value = minYear.value;
        } else if (fromYear.value > maxYear.value) {
            fromYear.value = maxYear.value;
        }

        if (toYear.value < minYear.value) {
            toYear.value = minYear.value;
        } else if (toYear.value > maxYear.value) {
            toYear.value = maxYear.value;
        }
        
        if (fromYear.value > toYear.value) {
            fromYear.value = toYear.value;
        }

        if (toYear.value < fromYear.value) {
            toYear.value = fromYear.value;
        }

        getOrganisationUnitPublicationCounts(props.organisationUnitId, fromYear.value, toYear.value);
    } else if(initialDatesSet.value) {
        watchDates.value = true;
    }
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

    getOrganisationUnitStatistics(
        props.organisationUnitId,
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
    );
});

onMounted(() => {
    getOrganisationUnitPublicationCounts(props.organisationUnitId);

    endDate.value = (new Date()).toISOString().split("T")[0];

    const currentDate = new Date();
    currentDate.setFullYear((new Date()).getFullYear() - 1);
    startDate.value = currentDate.toISOString().split("T")[0];

    deduceStartTab();
});

watch(currentTab, () => {
    fetchVisualizationsData();
});

const fetchVisualizationsData = () => {
    if(!props.organisationUnitId) {
        return;
    }

    if (currentTab.value !== "statistics" && totalPublicationCount.value === 0) {
        getOrganisationUnitPublicationCounts(props.organisationUnitId);
    } else if (currentTab.value === "statistics" && viewsByCountry.value.length === 0) {
        getOrganisationUnitStatistics(
            props.organisationUnitId,
            startDate.value.split("T")[0],
            endDate.value.split("T")[0]);
    }
};

const getOrganisationUnitPublicationCounts = (organisationUnitId: number, from: number | null = null, to: number | null = null) => {
    OrganisationUnitVisualizationService.getOrganisationUnitPublicationCountsByYear(organisationUnitId, from, to)
    .then(async response => {
        const yearlyCounts: YearlyCounts[] = response.data;

        const categories = yearlyCounts.map(yc => String(yc.year));

        if(categories.length > 0 && !initialDatesSet.value) {
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
            getMCategoryCounts(organisationUnitId);
        }
    });
};

const getOrganisationUnitStatistics = (organisationUnitId: number, startDate: string, endDate: string) => {
    OrganisationUnitVisualizationService.getOrganisationUnitViewsByCountry(
        organisationUnitId, startDate, endDate
    ).then(response => {
        viewsByCountry.value = response.data;
    });

    OrganisationUnitVisualizationService.getMonthlyViewsForOrganisationUnit(
        organisationUnitId, startDate, endDate
    ).then(response => {
        const categories: string[] = [];
        const series: number[] = [];
        
        Object.entries(response.data).forEach(pair => {
            categories.push(localiseDate(pair[0]));
            series.push(pair[1]);
        });

        viewsMonthly.value = {
            categories: categories, series: [
                {name: i18n.t("viewsLabel"), data: series}
            ]
        };
    });
};

const getMCategoryCounts = (organisationUnitId: number) => {
    OrganisationUnitVisualizationService.getOrganisationUnitMCategories(organisationUnitId, fromYear.value, toYear.value).then((response) => {
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

    OrganisationUnitVisualizationService.getOrganisationUnitMCategoryCounts(organisationUnitId, fromYear.value, toYear.value).then((response) => {
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

const deduceStartTab = () => {
    if (props.displayPublicationsTab) {
        currentTab.value = "publicationCount";
    } else if (props.displayTypeRatiosTab) {
        currentTab.value = "publicationType";
    } else if (props.displayStatisticsTab) {
        currentTab.value = "statistics";
    }
};

</script>
