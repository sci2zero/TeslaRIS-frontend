<template>
    <div class="candidates-tab">
        <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="candidates-title">
                {{ $t("publicationCandidateAnalysisLabel") }}
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

        <div v-else-if="!analysis" class="text-medium-emphasis">
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
                    <v-card class="candidates-card" variant="flat">
                        <v-card-text>
                            <div class="candidates-card-label">
                                {{ $t(card.label) }}
                            </div>
                            <div class="candidates-card-value" :class="card.emphasis">
                                {{ card.value }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-2">
                <v-col cols="12" md="6">
                    <v-card class="candidates-panel" variant="flat">
                        <v-card-text>
                            <h3 class="candidates-panel-title">
                                {{ $t("candidateRateByEntityTypeLabel") }}
                            </h3>

                            <div
                                v-for="row in analysis.candidateRateByEntityType"
                                :key="row.entityType"
                                class="d-flex align-center candidates-row">
                                <div class="candidates-row-name">
                                    {{ $t(entityTypeLabels[row.entityType]) }}
                                </div>

                                <v-progress-linear
                                    :model-value="row.publicationCandidatePercentage ?? 0"
                                    color="success"
                                    height="10"
                                    rounded
                                    class="candidates-row-bar"
                                />

                                <div class="candidates-row-rate">
                                    {{ formatPercentage(row.publicationCandidatePercentage) }}
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card class="candidates-panel" variant="flat">
                        <v-card-text>
                            <h3 class="candidates-panel-title">
                                {{ $t("mostCommonBlockingConstraintsLabel") }}
                            </h3>

                            <div
                                v-for="constraint in analysis.mostCommonBlockingConstraints"
                                :key="constraint.entityType"
                                class="d-flex align-center candidates-row">
                                <div class="candidates-constraint-title">
                                    {{ constraint.ruleKey
                                        ? displayTextOrPlaceholder(
                                            returnCurrentLocaleContent(constraint.title) as string)
                                        : "-" }}
                                </div>

                                <div class="candidates-constraint-entity text-medium-emphasis">
                                    {{ $t(entityTypeLabels[constraint.entityType]) }}
                                </div>

                                <div class="candidates-constraint-count text-error">
                                    {{ constraint.ruleKey
                                        ? localiseNumber(constraint.occurrences) : "-" }}
                                </div>

                                <v-btn
                                    density="compact"
                                    variant="text"
                                    color="primary"
                                    append-icon="mdi-arrow-right"
                                    :disabled="!constraint.ruleKey"
                                    @click="openIssues(constraint)">
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
import {
    RepositoryEntityType,
    type PrevalentIssue,
    type PublicationCandidateAnalysis
} from "@/models/RevisionModel";
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
    name: "RepositoryPublicationCandidatesTab",
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
        const analysis = ref<PublicationCandidateAnalysis | null>(null);
        const loading = ref(false);

        const i18n = useI18n();

        const localiseNumber = (value: number) => value.toLocaleString(i18n.locale.value);

        const formatPercentage = (value: number | null) =>
            value === null || value === undefined ? "-" : `${value.toFixed(1)}%`;

        const summaryCards = computed(() => [
            {
                label: "publicationCandidatesLabel",
                value: localiseNumber(analysis.value?.publicationCandidates ?? 0),
                emphasis: "text-success"
            },
            {
                label: "notPublicationCandidatesLabel",
                value: localiseNumber(analysis.value?.notPublicationCandidates ?? 0),
                emphasis: "text-error"
            },
            {
                label: "candidateRateLabel",
                value: formatPercentage(analysis.value?.candidateRate ?? null),
                emphasis: "text-success"
            },
            {
                label: "blockingIssuesLabel",
                value: localiseNumber(analysis.value?.blockingIssues ?? 0),
                emphasis: "text-error"
            }
        ]);

        const fetchAnalysis = () => {
            if (!props.profileName) {
                analysis.value = null;
                return;
            }

            loading.value = true;

            RepositoryAnalyticsService.getPublicationCandidateAnalysis(
                props.profileName, props.assessmentDate
            ).then(response => {
                analysis.value = response.data;
            }).catch(() => {
                analysis.value = null;
            }).finally(() => {
                loading.value = false;
            });
        };

        // TODO: the drill-down into a blocking constraint's issues is not implemented yet.
        const openIssues = (constraint: PrevalentIssue) => {
            emit("openIssues", {
                entityType: constraint.entityType,
                ruleKey: constraint.ruleKey
            });
        };

        const downloadReport = () => {
            if (!props.profileName) {
                return;
            }

            RepositoryAnalyticsService.downloadPublicationCandidateAnalysis(
                props.profileName, props.assessmentDate, i18n.locale.value);
        };

        watch(() => [props.profileName, props.assessmentDate], fetchAnalysis, { immediate: true });

        return {
            analysis, loading, summaryCards, entityTypeLabels: ENTITY_TYPE_LABELS,
            localiseNumber, formatPercentage, returnCurrentLocaleContent,
            displayTextOrPlaceholder, openIssues, downloadReport
        };
    }
});
</script>

<style scoped>
.candidates-tab {
    padding-top: 8px;
}

.candidates-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.4rem;
    font-weight: 700;
}

.candidates-card,
.candidates-panel {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    height: 100%;
}

.candidates-card-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.75rem;
    margin-bottom: 4px;
}

.candidates-card-value {
    font-size: 1.7rem;
    font-weight: 700;
}

.candidates-panel-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 14px;
}

.candidates-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 10px 0;
}

.candidates-row:last-child {
    border-bottom: none;
}

.candidates-row-name {
    font-weight: 600;
    min-width: 150px;
}

.candidates-row-bar {
    flex: 1;
    margin: 0 12px;
}

.candidates-row-rate {
    color: rgb(var(--v-theme-primary));
    font-weight: 700;
    min-width: 60px;
    text-align: right;
}

.candidates-constraint-title {
    color: rgb(var(--v-theme-primary));
    flex: 1;
    font-weight: 600;
}

.candidates-constraint-entity {
    font-size: 0.8rem;
    min-width: 130px;
}

.candidates-constraint-count {
    font-weight: 700;
    margin-right: 12px;
    min-width: 70px;
    text-align: right;
}
</style>
