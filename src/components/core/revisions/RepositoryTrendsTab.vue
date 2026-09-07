<template>
    <div class="trends-tab">
        <div class="d-flex flex-wrap align-center mb-4">
            <h2 class="trends-title">
                {{ $t("qualityTrendsLabel") }}
            </h2>

            <div class="trends-metric ms-8">
                <v-select
                    v-model="selectedMetric"
                    :items="metricOptions"
                    item-title="title"
                    item-value="value"
                    :label="$t('metricLabel')"
                    density="compact"
                    variant="outlined"
                    hide-details
                />
            </div>

            <v-btn-toggle
                v-model="selectedGranularity"
                mandatory
                density="compact"
                color="deep-purple-accent-4"
                variant="outlined"
                class="ms-4">
                <v-btn
                    v-for="granularity in granularities"
                    :key="granularity"
                    :value="granularity">
                    {{ $t(granularityLabels[granularity]) }}
                </v-btn>
            </v-btn-toggle>

            <div class="trends-points ms-4">
                <v-text-field
                    v-model.number="selectedPoints"
                    type="number"
                    :min="MIN_POINTS"
                    :max="MAX_POINTS"
                    :label="$t('pointsLabel')"
                    density="compact"
                    variant="outlined"
                    hide-details
                />
            </div>

            <v-btn
                variant="outlined"
                color="primary"
                append-icon="mdi-download"
                :disabled="!profileName"
                class="ms-auto"
                @click="downloadReport">
                {{ $t("downloadReportLabel") }}
            </v-btn>
        </div>

        <tab-content-loader v-if="loading" layout="sections" />

        <div v-else-if="!trend" class="text-medium-emphasis">
            {{ $t("noAssessmentsLabel") }}
        </div>

        <template v-else>
            <v-row>
                <v-col cols="12" md="8">
                    <v-card class="trends-panel" variant="flat">
                        <v-card-text>
                            <h3 class="trends-panel-title">
                                {{ $t("metricOverTimeLabel", [metricTitle]) }}
                            </h3>

                            <line-chart
                                :points="chartPoints"
                                :series-name="metricTitle"
                                :y-label="$t('scoreOrRateLabel')"
                            />
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card class="trends-panel" variant="flat">
                        <v-card-text>
                            <h3 class="trends-panel-title">
                                {{ $t("currentIndicatorsLabel") }}
                            </h3>

                            <div class="trends-selected-metric mb-4">
                                {{ $t("selectedMetricLabel", [metricTitle]) }}
                            </div>

                            <div
                                v-for="indicator in indicatorRows"
                                :key="indicator.label"
                                class="d-flex align-center trends-row">
                                <div class="trends-row-name">
                                    {{ $t(indicator.label) }}
                                </div>
                                <div
                                    class="trends-row-value"
                                    :class="indicator.emphasis">
                                    {{ indicator.value }}
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-2">
                <v-col cols="12">
                    <v-card class="trends-panel" variant="flat">
                        <v-card-text>
                            <h3 class="trends-panel-title">
                                {{ $t("trendByEntityTypeLabel") }}
                            </h3>

                            <v-row>
                                <v-col
                                    v-for="row in trend.trendByEntityType"
                                    :key="row.entityType"
                                    cols="12"
                                    sm="6"
                                    md="4">
                                    <div class="d-flex align-center trends-row">
                                        <div class="trends-entity-name">
                                            {{ $t(entityTypeLabels[row.entityType]) }}
                                        </div>
                                        <div class="trends-entity-value">
                                            {{ formatValue(row.current) }}
                                        </div>
                                        <div
                                            class="trends-entity-change"
                                            :class="changeColorClass(row.change)">
                                            {{ formatChange(row.change) }}
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </template>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import RepositoryAnalyticsService from "@/services/revision/RepositoryAnalyticsService";
import {
    RepositoryEntityType,
    TrendGranularity,
    TrendMetric,
    type QualityTrend
} from "@/models/RevisionModel";
import {
    getTrendMetricsForGivenLocale,
    getTrendMetricTitleFromValueAutoLocale
} from "@/i18n/trendMetric";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import LineChart from "@/components/charts/LineChart.vue";


const MIN_POINTS = 2;

const MAX_POINTS = 10;

const ENTITY_TYPE_LABELS: Record<RepositoryEntityType, string> = {
    [RepositoryEntityType.PERSONS]: "routeLabel.persons",
    [RepositoryEntityType.ORGANISATION_UNITS]: "organisationUnitsLabel",
    [RepositoryEntityType.OUTPUTS]: "outputsLabel",
    [RepositoryEntityType.ACTIVITIES]: "activitiesLabel",
    [RepositoryEntityType.PROJECTS]: "projectsLabel",
    [RepositoryEntityType.FUNDINGS]: "fundingsLabel"
};

const GRANULARITY_LABELS: Record<TrendGranularity, string> = {
    [TrendGranularity.DAILY]: "dailyLabel",
    [TrendGranularity.WEEKLY]: "weeklyLabel",
    [TrendGranularity.MONTHLY]: "monthlyLabel"
};

export default defineComponent({
    name: "RepositoryTrendsTab",
    components: { TabContentLoader, LineChart },
    props: {
        profileName: {
            type: String,
            default: undefined
        },
        assessmentDate: {
            type: String,
            default: undefined
        }
    },
    setup(props) {
        const trend = ref<QualityTrend | null>(null);
        const loading = ref(false);

        const selectedMetric = ref<TrendMetric>(TrendMetric.OVERALL_SCORE);
        const selectedGranularity = ref<TrendGranularity>(TrendGranularity.WEEKLY);
        const selectedPoints = ref<number | undefined>(undefined);
        const metricOptions = ref(getTrendMetricsForGivenLocale());

        const i18n = useI18n();

        const metricTitle = computed(() =>
            getTrendMetricTitleFromValueAutoLocale(selectedMetric.value) ?? "");

        const formatValue = (value: number | null | undefined) =>
            value === null || value === undefined ? "-" : `${value.toFixed(1)}%`;

        const formatChange = (change: number | null | undefined) => {
            if (change === null || change === undefined) {
                return "-";
            }

            return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
        };

        // A missing change is not a fall: unsupported rows and a series with a single point both
        // come back as null, and comparing that against zero would paint them red.
        const changeColorClass = (change: number | null | undefined) => {
            if (change === null || change === undefined) {
                return "";
            }

            return change >= 0 ? "text-success" : "text-error";
        };

        const chartPoints = computed(() =>
            (trend.value?.series ?? []).map(point => ({
                label: point.label,
                value: point.value,
                annotation: i18n.t("recordsAssessedLabel") + ": " +
                    point.recordsAssessed.toLocaleString(i18n.locale.value)
            })));

        const indicatorRows = computed(() => {
            const indicators = trend.value?.indicators;

            return [
                {
                    label: "currentScoreLabel",
                    value: formatValue(indicators?.current),
                    emphasis: "text-success"
                },
                {
                    label: "previousScoreLabel",
                    value: formatValue(indicators?.previous),
                    emphasis: "text-primary"
                },
                {
                    label: "changeLabel",
                    value: formatChange(indicators?.change),
                    emphasis: changeColorClass(indicators?.change)
                },
                {
                    label: "bestScoreLabel",
                    value: formatValue(indicators?.best),
                    emphasis: "text-success"
                },
                {
                    label: "lowestScoreLabel",
                    value: formatValue(indicators?.lowest),
                    emphasis: "text-primary"
                }
            ];
        });

        const fetchTrend = () => {
            if (!props.profileName) {
                trend.value = null;
                return;
            }

            loading.value = true;

            RepositoryAnalyticsService.getQualityTrend(
                props.profileName, props.assessmentDate, selectedMetric.value,
                selectedGranularity.value, selectedPoints.value
            ).then(response => {
                trend.value = response.data;
            }).catch(() => {
                trend.value = null;
            }).finally(() => {
                loading.value = false;
            });
        };

        const downloadReport = () => {
            if (!props.profileName) {
                return;
            }

            RepositoryAnalyticsService.downloadQualityTrend(
                props.profileName, props.assessmentDate, selectedMetric.value,
                selectedGranularity.value, selectedPoints.value, i18n.locale.value);
        };

        watch(
            () => [
                props.profileName, props.assessmentDate, selectedMetric.value,
                selectedGranularity.value, selectedPoints.value
            ],
            fetchTrend,
            { immediate: true }
        );

        watch(i18n.locale, () => {
            metricOptions.value = getTrendMetricsForGivenLocale();
        });

        return {
            trend, loading, selectedMetric, selectedGranularity, selectedPoints, metricOptions,
            metricTitle, chartPoints, indicatorRows, granularities: Object.values(TrendGranularity),
            granularityLabels: GRANULARITY_LABELS, entityTypeLabels: ENTITY_TYPE_LABELS,
            formatValue, formatChange, changeColorClass, downloadReport,
            MIN_POINTS, MAX_POINTS
        };
    }
});
</script>

<style scoped>
.trends-tab {
    padding-top: 8px;
}

.trends-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.4rem;
    font-weight: 700;
}

.trends-metric {
    min-width: 240px;
}

.trends-points {
    max-width: 110px;
}

.trends-panel {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    height: 100%;
}

.trends-panel-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 14px;
}

.trends-selected-metric {
    color: rgb(var(--v-theme-primary));
    font-size: 0.8rem;
    font-weight: 600;
}

.trends-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 10px 0;
}

.trends-row:last-child {
    border-bottom: none;
}

.trends-row-name {
    color: rgba(0, 0, 0, 0.7);
    flex: 1;
}

.trends-row-value {
    font-weight: 700;
}

.trends-entity-name {
    flex: 1;
    font-weight: 600;
}

.trends-entity-value {
    color: rgb(var(--v-theme-primary));
    font-weight: 700;
    margin-right: 12px;
}

.trends-entity-change {
    font-weight: 700;
    min-width: 60px;
    text-align: right;
}
</style>
