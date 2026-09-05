<template>
    <div class="statistics-tab">
        <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="statistics-title">
                {{ $t("issueStatisticsLabel") }}
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

        <div v-else-if="!statistics" class="text-medium-emphasis">
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
                    <v-card class="statistics-card" variant="flat">
                        <v-card-text>
                            <div class="statistics-card-label">
                                {{ $t(card.label) }}
                            </div>
                            <div class="statistics-card-value" :class="card.emphasis">
                                {{ card.value }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-2">
                <v-col cols="12" md="6">
                    <v-card class="statistics-panel" variant="flat">
                        <v-card-text>
                            <h3 class="statistics-panel-title">
                                {{ $t("issuesBySeverityAndEntityTypeLabel") }}
                            </h3>

                            <v-table density="compact" class="statistics-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th class="text-right">
                                            {{ $t("errorIssuesLabel") }}
                                        </th>
                                        <th class="text-right">
                                            {{ $t("warningIssuesLabel") }}
                                        </th>
                                        <th class="text-right">
                                            {{ $t("infoIssuesLabel") }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="row in statistics.issuesBySeverityAndEntityType"
                                        :key="row.entityType">
                                        <td class="statistics-row-name">
                                            {{ $t(entityTypeLabels[row.entityType]) }}
                                        </td>
                                        <td class="text-right text-error font-weight-bold">
                                            {{ severityValue(row, row.errorIssues) }}
                                        </td>
                                        <td class="text-right text-warning font-weight-bold">
                                            {{ severityValue(row, row.warningIssues) }}
                                        </td>
                                        <td class="text-right text-info font-weight-bold">
                                            {{ severityValue(row, row.infoIssues) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card class="statistics-panel" variant="flat">
                        <v-card-text>
                            <h3 class="statistics-panel-title">
                                {{ $t("topRecurringConstraintsLabel") }}
                            </h3>

                            <div
                                v-if="statistics.topRecurringConstraints.length === 0"
                                class="text-medium-emphasis">
                                {{ $t("noFailedConstraintsMessage") }}
                            </div>

                            <div
                                v-for="constraint in statistics.topRecurringConstraints"
                                :key="constraint.ruleKey ?? ''"
                                class="d-flex align-center statistics-row">
                                <div class="statistics-constraint-title">
                                    {{ displayTextOrPlaceholder(
                                        returnCurrentLocaleContent(constraint.title) as string) }}
                                </div>

                                <div class="statistics-constraint-count text-error">
                                    {{ localiseNumber(constraint.occurrences) }}
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
    type IssueStatistics,
    type RecurringConstraint,
    type SeverityBreakdown
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
    name: "RepositoryIssueStatisticsTab",
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
        const statistics = ref<IssueStatistics | null>(null);
        const loading = ref(false);

        const i18n = useI18n();

        const localiseNumber = (value: number) => value.toLocaleString(i18n.locale.value);

        const severityValue = (row: SeverityBreakdown, value: number) =>
            row.supported ? localiseNumber(value) : "-";

        const summaryCards = computed(() => [
            {
                label: "openIssuesLabel",
                value: localiseNumber(statistics.value?.openIssues ?? 0),
                emphasis: "text-error"
            },
            {
                label: "errorIssuesLabel",
                value: localiseNumber(statistics.value?.errorIssues ?? 0),
                emphasis: "text-error"
            },
            {
                label: "warningIssuesLabel",
                value: localiseNumber(statistics.value?.warningIssues ?? 0),
                emphasis: "text-warning"
            },
            {
                label: "infoIssuesLabel",
                value: localiseNumber(statistics.value?.infoIssues ?? 0),
                emphasis: "text-info"
            }
        ]);

        const fetchStatistics = () => {
            if (!props.profileName) {
                statistics.value = null;
                return;
            }

            loading.value = true;

            RepositoryAnalyticsService.getIssueStatistics(
                props.profileName, props.assessmentDate
            ).then(response => {
                statistics.value = response.data;
            }).catch(() => {
                statistics.value = null;
            }).finally(() => {
                loading.value = false;
            });
        };

        // TODO: the drill-down into a constraint's issues is not implemented yet.
        const openIssues = (constraint: RecurringConstraint) => {
            emit("openIssues", { ruleKey: constraint.ruleKey });
        };

        const downloadReport = () => {
            if (!props.profileName) {
                return;
            }

            RepositoryAnalyticsService.downloadIssueStatistics(
                props.profileName, props.assessmentDate, i18n.locale.value);
        };

        watch(() => [props.profileName, props.assessmentDate], fetchStatistics,
            { immediate: true });

        return {
            statistics, loading, summaryCards, entityTypeLabels: ENTITY_TYPE_LABELS,
            localiseNumber, severityValue, returnCurrentLocaleContent,
            displayTextOrPlaceholder, openIssues, downloadReport
        };
    }
});
</script>

<style scoped>
.statistics-tab {
    padding-top: 8px;
}

.statistics-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.4rem;
    font-weight: 700;
}

.statistics-card,
.statistics-panel {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    height: 100%;
}

.statistics-card-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.75rem;
    margin-bottom: 4px;
}

.statistics-card-value {
    font-size: 1.7rem;
    font-weight: 700;
}

.statistics-panel-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 14px;
}

.statistics-table :deep(th) {
    color: rgba(0, 0, 0, 0.6) !important;
    font-size: 0.75rem;
    font-weight: 500;
}

.statistics-row-name {
    font-weight: 600;
}

.statistics-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 10px 0;
}

.statistics-row:last-child {
    border-bottom: none;
}

.statistics-constraint-title {
    color: rgb(var(--v-theme-primary));
    flex: 1;
    font-weight: 600;
}

.statistics-constraint-count {
    font-weight: 700;
    margin-right: 12px;
    min-width: 70px;
    text-align: right;
}
</style>
