<template>
    <div class="dimensions-tab">
        <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="dimensions-title">
                {{ $t("qualityByDimensionLabel") }}
            </h2>

            <v-btn
                variant="outlined"
                color="primary"
                append-icon="mdi-download"
                :disabled="!profileName"
                class="mt-2 ms-auto"
                @click="downloadReport">
                {{ $t("downloadReportLabel") }}
            </v-btn>
        </div>

        <tab-content-loader v-if="loading" layout="sections" />

        <div v-else-if="dimensions.length === 0" class="text-medium-emphasis">
            {{ $t("noAssessmentsLabel") }}
        </div>

        <v-row v-else>
            <v-col
                v-for="dimension in dimensions"
                :key="dimension.dimension"
                cols="12"
                md="6">
                <v-card class="dimension-card" variant="flat">
                    <v-card-text>
                        <div class="dimension-name">
                            {{ dimensionTitle(dimension.dimension) }}
                        </div>

                        <div class="d-flex flex-wrap align-center">
                            <div class="dimension-score mr-8">
                                {{ formatPercentage(dimension.averageScore) }}
                            </div>

                            <div class="dimension-figure mr-8">
                                <div class="dimension-figure-label">
                                    {{ $t("openIssuesLabel") }}
                                </div>
                                <div class="dimension-figure-value text-error">
                                    {{ localiseNumber(dimension.openIssues) }}
                                </div>
                            </div>

                            <div class="dimension-figure">
                                <div class="dimension-figure-label">
                                    {{ $t("affectedRecordsLabel") }}
                                </div>
                                <div class="dimension-figure-value">
                                    {{ localiseNumber(dimension.affectedRecords) }}
                                </div>
                            </div>

                            <v-btn
                                density="compact"
                                variant="text"
                                color="primary"
                                class="ms-auto"
                                append-icon="mdi-arrow-right"
                                :disabled="dimension.openIssues === 0"
                                @click="openIssues(dimension)">
                                {{ $t("openIssuesLabel") }}
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import RepositoryAnalyticsService from "@/services/revision/RepositoryAnalyticsService";
import { QualityDimension, type DimensionQuality } from "@/models/RevisionModel";
import { getQualityDimensionTitleFromValueAutoLocale } from "@/i18n/qualityDimension";
import TabContentLoader from "@/components/core/TabContentLoader.vue";


export default defineComponent({
    name: "RepositoryDimensionsTab",
    components: { TabContentLoader },
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
    emits: ["openIssues"],
    setup(props, { emit }) {
        const dimensions = ref<DimensionQuality[]>([]);
        const loading = ref(false);

        const i18n = useI18n();

        const localiseNumber = (value: number) => value.toLocaleString(i18n.locale.value);

        const formatPercentage = (value: number | null) =>
            value === null || value === undefined ? "-" : `${value.toFixed(1)}%`;

        const dimensionTitle = (dimension: QualityDimension) =>
            getQualityDimensionTitleFromValueAutoLocale(dimension);

        const fetchDimensions = () => {
            if (!props.profileName) {
                dimensions.value = [];
                return;
            }

            loading.value = true;

            RepositoryAnalyticsService.getQualityByDimension(
                props.profileName, props.assessmentDate
            ).then(response => {
                dimensions.value = response.data;
            }).catch(() => {
                dimensions.value = [];
            }).finally(() => {
                loading.value = false;
            });
        };

        // TODO: the drill-down into a dimension's issues is not implemented yet.
        const openIssues = (dimension: DimensionQuality) => {
            emit("openIssues", dimension.dimension);
        };

        const downloadReport = () => {
            if (!props.profileName) {
                return;
            }

            RepositoryAnalyticsService.downloadQualityByDimension(
                props.profileName, props.assessmentDate, i18n.locale.value);
        };

        watch(() => [props.profileName, props.assessmentDate], fetchDimensions,
            { immediate: true });

        return {
            dimensions, loading, localiseNumber, formatPercentage, dimensionTitle,
            openIssues, downloadReport
        };
    }
});
</script>

<style scoped>
.dimensions-tab {
    padding-top: 8px;
}

.dimensions-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.4rem;
    font-weight: 700;
}

.dimension-card {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    height: 100%;
}

.dimension-name {
    color: rgb(var(--v-theme-primary));
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 10px;
}

.dimension-score {
    color: rgb(var(--v-theme-primary));
    font-size: 1.8rem;
    font-weight: 700;
}

.dimension-figure-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.72rem;
}

.dimension-figure-value {
    font-size: 0.95rem;
    font-weight: 700;
}
</style>
