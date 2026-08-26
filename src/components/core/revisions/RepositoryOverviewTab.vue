<template>
    <div class="overview-tab">
        <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="overview-title">
                {{ $t("repositoryQualityOverviewLabel") }}
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

        <div v-else-if="!overview" class="text-medium-emphasis">
            {{ $t("noAssessmentsLabel") }}
        </div>

        <template v-else>
            <v-row>
                <v-col
                    v-for="card in summaryCards"
                    :key="card.label"
                    cols="12"
                    sm="6"
                    md="3">
                    <v-card class="overview-card" variant="flat">
                        <v-card-text>
                            <div class="overview-card-label">
                                {{ $t(card.label) }}
                            </div>
                            <div class="overview-card-value" :class="card.emphasis">
                                {{ card.value }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-2">
                <v-col cols="12" md="6">
                    <v-card class="overview-panel" variant="flat">
                        <v-card-text>
                            <h3 class="overview-panel-title">
                                {{ $t("qualityByEntityTypeLabel") }}
                            </h3>

                            <div
                                v-for="row in overview.qualityByEntityType"
                                :key="row.entityType"
                                class="d-flex align-center overview-row">
                                <div class="overview-row-name">
                                    {{ $t(entityTypeLabels[row.entityType]) }}
                                </div>

                                <v-progress-linear
                                    :model-value="row.averageScore ?? 0"
                                    color="primary"
                                    height="10"
                                    rounded
                                    class="overview-row-bar"
                                />

                                <div class="overview-row-score">
                                    {{ formatPercentage(row.averageScore) }}
                                </div>

                                <v-btn
                                    density="compact"
                                    variant="text"
                                    color="primary"
                                    append-icon="mdi-arrow-right"
                                    :disabled="!row.supported || row.openIssues === 0"
                                    @click="openIssues(row.entityType)">
                                    {{ $t("openIssuesLabel") }}
                                </v-btn>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card class="overview-panel" variant="flat">
                        <v-card-text>
                            <h3 class="overview-panel-title">
                                {{ $t("issuesRequiringAttentionLabel") }}
                            </h3>

                            <div
                                v-for="issue in overview.issuesRequiringAttention"
                                :key="issue.entityType"
                                class="d-flex align-center overview-row">
                                <div class="overview-issue-title">
                                    {{ issue.ruleKey
                                        ? displayTextOrPlaceholder(
                                            returnCurrentLocaleContent(issue.title) as string)
                                        : "-" }}
                                </div>

                                <div class="overview-issue-entity text-medium-emphasis">
                                    {{ $t(entityTypeLabels[issue.entityType]) }}
                                </div>

                                <div class="overview-issue-count text-error">
                                    {{ issue.ruleKey ? localiseNumber(issue.occurrences) : "-" }}
                                </div>

                                <v-btn
                                    density="compact"
                                    variant="text"
                                    color="primary"
                                    append-icon="mdi-arrow-right"
                                    :disabled="!issue.ruleKey"
                                    @click="openIssues(issue.entityType, issue.ruleKey)">
                                    {{ $t("openIssuesLabel") }}
                                </v-btn>
                            </div>
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
import { RepositoryEntityType, type RepositoryOverview } from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import TabContentLoader from "@/components/core/TabContentLoader.vue";


const ENTITY_TYPE_LABELS: Record<RepositoryEntityType, string> = {
    [RepositoryEntityType.PERSONS]: "routeLabel.persons",
    [RepositoryEntityType.ORGANISATION_UNITS]: "organisationUnitsLabel",
    [RepositoryEntityType.OUTPUTS]: "outputsLabel",
    [RepositoryEntityType.ACTIVITIES]: "activitiesLabel",
    [RepositoryEntityType.PROJECTS]: "projectsLabel",
    [RepositoryEntityType.FUNDINGS]: "fundingsLabel"
};

export default defineComponent({
    name: "RepositoryOverviewTab",
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
        const overview = ref<RepositoryOverview | null>(null);
        const loading = ref(false);

        const i18n = useI18n();

        const localiseNumber = (value: number) => value.toLocaleString(i18n.locale.value);

        const formatPercentage = (value: number | null) =>
            value === null || value === undefined ? "-" : `${value.toFixed(1)}%`;

        const summaryCards = computed(() => [
            {
                label: "averageScoreLabel",
                value: formatPercentage(overview.value?.averageScore ?? null),
                emphasis: "text-primary"
            },
            {
                label: "publicationCandidatesLabel",
                value: formatPercentage(overview.value?.publicationCandidatePercentage ?? null),
                emphasis: "text-primary"
            },
            {
                label: "openIssuesLabel",
                value: localiseNumber(overview.value?.openIssues ?? 0),
                emphasis: "text-error"
            },
            {
                label: "recordsAssessedLabel",
                value: localiseNumber(overview.value?.recordsAssessed ?? 0),
                emphasis: "text-primary"
            }
        ]);

        const fetchOverview = () => {
            if (!props.profileName) {
                overview.value = null;
                return;
            }

            loading.value = true;

            RepositoryAnalyticsService.getOverview(
                props.profileName, props.assessmentDate
            ).then(response => {
                overview.value = response.data;
            }).catch(() => {
                overview.value = null;
            }).finally(() => {
                loading.value = false;
            });
        };

        // TODO: the drill-down into the issues of an entity type is not implemented yet.
        const openIssues = (entityType: RepositoryEntityType, ruleKey?: string | null) => {
            emit("openIssues", { entityType, ruleKey });
        };

        const downloadReport = () => {
            if (!props.profileName) {
                return;
            }

            RepositoryAnalyticsService.downloadOverview(
                props.profileName, props.assessmentDate, i18n.locale.value);
        };

        watch(() => [props.profileName, props.assessmentDate], fetchOverview, { immediate: true });

        return {
            overview, loading, summaryCards, entityTypeLabels: ENTITY_TYPE_LABELS,
            localiseNumber, formatPercentage, returnCurrentLocaleContent,
            displayTextOrPlaceholder, openIssues, downloadReport
        };
    }
});
</script>

<style scoped>
.overview-tab {
    padding-top: 8px;
}

.overview-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.4rem;
    font-weight: 700;
}

.overview-card,
.overview-panel {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    height: 100%;
}

.overview-card-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.75rem;
    margin-bottom: 4px;
}

.overview-card-value {
    font-size: 1.7rem;
    font-weight: 700;
}

.overview-panel-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 14px;
}

.overview-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 10px 0;
}

.overview-row:last-child {
    border-bottom: none;
}

.overview-row-name {
    font-weight: 600;
    min-width: 150px;
}

.overview-row-bar {
    flex: 1;
    margin: 0 12px;
}

.overview-row-score {
    font-weight: 700;
    margin-right: 12px;
    min-width: 60px;
    text-align: right;
}

.overview-issue-title {
    color: rgb(var(--v-theme-primary));
    flex: 1;
    font-weight: 600;
}

.overview-issue-entity {
    font-size: 0.8rem;
    min-width: 130px;
}

.overview-issue-count {
    font-weight: 700;
    margin-right: 12px;
    min-width: 70px;
    text-align: right;
}
</style>
