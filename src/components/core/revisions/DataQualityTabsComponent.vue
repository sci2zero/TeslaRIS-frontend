<template>
    <v-tabs
        v-model="currentSubTab"
        color="primary"
        align-tabs="start">
        <v-tab value="assessment">
            {{ $t("assessmentLabel") }}
        </v-tab>
        <v-tab v-if="supportsRelatedQuality" value="relatedQuality">
            {{ $t("relatedQualityLabel") }}
        </v-tab>
        <v-tab v-if="supportsQualityIssues" value="qualityIssues">
            {{ $t("dataQualityIssuesLabel") }}
        </v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentSubTab">
        <v-tabs-window-item value="assessment">
            <tab-content-loader v-if="loading" :button-header="false" layout="table" />

            <template v-else-if="selectedAssessment">
                <v-card class="dq-card mt-5 mb-5" variant="flat">
                    <v-card-text>
                        <v-row align="center">
                            <v-col cols="12" md="3">
                                <div class="context-label">
                                    {{ $t("qualityProfileLabel") }}
                                </div>
                                <div class="context-value">
                                    {{ selectedAssessment.profileName }}
                                </div>
                            </v-col>
                            <v-col cols="6" md="2">
                                <div class="context-label">
                                    {{ $t("versionLabel") }}
                                </div>
                                <div class="context-value">
                                    {{ selectedAssessment.profileVersion }}
                                </div>
                            </v-col>
                            <v-col cols="6" md="2">
                                <div class="context-label">
                                    {{ $t("assessmentDateLabel") }}
                                </div>
                                <div class="context-value">
                                    {{ localiseDate(selectedAssessment.finishedAt) }}
                                </div>
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-select
                                    v-model="selectedVersion"
                                    :items="versionItems"
                                    :label="$t('recordVersionLabel')"
                                    density="compact"
                                    hide-details
                                    return-object
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-btn
                                    class="download-report-button"
                                    color="primary"
                                    variant="outlined"
                                    density="comfortable"
                                    block
                                    append-icon="mdi-chevron-down"
                                    @click="downloadFullReport">
                                    {{ $t("downloadFullAssessmentReportLabel") }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <h3 class="assessment-title">
                    {{ $t("assessmentForVersionLabel", [versionLabelFor(selectedVersion)]) }}
                </h3>

                <v-tabs
                    v-if="assessments.length > 1"
                    v-model="selectedProfileIndex"
                    color="primary"
                    density="compact"
                    class="mb-3">
                    <v-tab
                        v-for="(assessment, index) in assessments"
                        :key="assessment.assessmentId"
                        :value="index">
                        {{ assessment.profileName }}
                    </v-tab>
                </v-tabs>

                <v-row class="mb-1">
                    <v-col cols="12" sm="6" md="3">
                        <v-card variant="flat" class="dq-card score-card">
                            <v-card-text>
                                <div class="context-label">
                                    {{ $t("overallScoreLabel") }}
                                </div>
                                <div
                                    class="score-value"
                                    :class="scoreColorClass(selectedAssessment.qualityScore)">
                                    {{ selectedAssessment.qualityScore.toFixed(1) }}%
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-card variant="flat" class="dq-card score-card">
                            <v-card-text>
                                <div class="context-label">
                                    {{ $t("fairComplianceLabel") }}
                                </div>
                                <div
                                    class="score-value"
                                    :class="scoreColorClass(selectedAssessment.qualityScoreFair)">
                                    {{ selectedAssessment.qualityScoreFair.toFixed(1) }}%
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-card variant="flat" class="dq-card score-card">
                            <v-card-text>
                                <div class="context-label">
                                    {{ $t("passedLabel") }}
                                </div>
                                <div class="score-value text-success">
                                    {{ selectedAssessment.passedRules }} / {{ totalRules }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-card variant="flat" class="dq-card score-card">
                            <v-card-text>
                                <div class="context-label">
                                    {{ $t("failedLabel") }}
                                </div>
                                <div
                                    class="score-value"
                                    :class="failedRules.length > 0 ? 'text-error' : 'text-success'">
                                    {{ failedRules.length }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <v-card variant="flat" class="dq-card mt-5">
                    <v-card-text>
                        <h4 class="constraints-title">
                            {{ $t("failedConstraintsLabel") }} ({{ failedRules.length }})
                        </h4>

                        <div v-if="failedRules.length === 0" class="text-medium-emphasis">
                            {{ $t("noFailedConstraintsMessage") }}
                        </div>

                        <v-table v-else density="compact">
                            <thead>
                                <tr>
                                    <th>{{ $t("constraintLabel") }}</th>
                                    <th>{{ $t("dimensionLabel") }}</th>
                                    <th>{{ $t("severityLabel") }}</th>
                                    <th>{{ $t("messageLabel") }}</th>
                                    <th>{{ $t("actionLabel") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="rule in failedRules" :key="rule.key">
                                    <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(rule.title) as string) }}</td>
                                    <td>{{ rule.dimension }}</td>
                                    <td>
                                        <v-chip
                                            :color="severityColors[rule.severity]"
                                            variant="tonal"
                                            size="small">
                                            {{ rule.severity }}
                                        </v-chip>
                                    </td>
                                    <td>
                                        {{ displayTextOrPlaceholder(returnCurrentLocaleContent(rule.message) as string) }}
                                        <div v-if="rule.actualValue" class="text-medium-emphasis text-caption">
                                            {{ rule.actualValue }}
                                        </div>
                                    </td>
                                    <td>
                                        <v-btn
                                            density="compact"
                                            variant="text"
                                            color="primary"
                                            append-icon="mdi-arrow-right"
                                            @click="showConstraintDetails(rule)">
                                            {{ $t("viewDetailsLabel") }}
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>
            </template>

            <div v-else class="text-medium-emphasis mt-5">
                {{ $t("noAssessmentsLabel") }}
            </div>
        </v-tabs-window-item>

        <v-tabs-window-item v-if="supportsRelatedQuality" value="relatedQuality">
            <div class="text-medium-emphasis mt-5">
                {{ $t("notYetSetMessage") }}
            </div>
        </v-tabs-window-item>

        <v-tabs-window-item v-if="supportsQualityIssues" value="qualityIssues">
            <div class="text-medium-emphasis mt-5">
                {{ $t("notYetSetMessage") }}
            </div>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
import {
    IssueSeverity,
    type DataQualityAssessment,
    type DataQualityRuleResult,
    type Revision
} from "@/models/RevisionModel";
import { EntityType } from "@/models/MergeModel";
import DataQualityService from "@/services/revision/DataQualityService";
import RevisionService from "@/services/revision/RevisionService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import TabContentLoader from "@/components/core/TabContentLoader.vue";


interface VersionItem {
    title: string;
    majorVersion: number;
    minorVersion: number;
}

export default defineComponent({
    name: "DataQualityTabsComponent",
    components: { TabContentLoader },
    props: {
        entityType: {
            type: String,
            required: true
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        }
    },
    setup(props) {
        const currentSubTab = ref("assessment");
        const loading = ref(false);

        const revisions = ref<Revision[]>([]);
        const assessments = ref<DataQualityAssessment[]>([]);
        const selectedProfileIndex = ref(0);
        const selectedVersion = ref<VersionItem | undefined>(undefined);

        const severityColors = {
            [IssueSeverity.ERROR]: "error",
            [IssueSeverity.WARNING]: "warning",
            [IssueSeverity.INFO]: "info"
        };

        const supportsRelatedQuality = computed(() =>
            props.entityType === EntityType.PERSON ||
            props.entityType === EntityType.ORGANISATION_UNIT);

        const supportsQualityIssues = supportsRelatedQuality;

        const versionItems = computed<VersionItem[]>(() =>
            revisions.value.map(revision => ({
                title: `${revision.majorVersion}.${revision.minorVersion}`,
                majorVersion: revision.majorVersion,
                minorVersion: revision.minorVersion
            })));

        const selectedAssessment = computed<DataQualityAssessment | undefined>(() =>
            assessments.value[selectedProfileIndex.value]);

        const failedRules = computed(() => selectedAssessment.value?.failedRulesList ?? []);

        const totalRules = computed(() =>
            (selectedAssessment.value?.passedRules ?? 0) + failedRules.value.length);

        // TODO: report generation is not implemented yet.
        const downloadFullReport = () => {
        };

        // TODO: per-constraint drill-down is not implemented yet.
        const showConstraintDetails = (_rule: DataQualityRuleResult) => {
        };

        const versionLabelFor = (version: VersionItem | undefined) =>
            version ? `${version.majorVersion}.${version.minorVersion}` : "";

        const scoreColorClass = (score: number | undefined) => {
            if (score === undefined) {
                return "";
            }

            if (score < 40) {
                return "text-error";
            }

            if (score < 70) {
                return "text-warning";
            }

            return "text-success";
        };

        const fetchAssessments = () => {
            if (!props.entityId || !selectedVersion.value) {
                assessments.value = [];
                return;
            }

            loading.value = true;

            DataQualityService.getAssessmentsForVersion(
                props.entityType,
                props.entityId,
                selectedVersion.value.majorVersion,
                selectedVersion.value.minorVersion
            ).then(response => {
                assessments.value = response.data;
                selectedProfileIndex.value = 0;
            }).catch(() => {
                assessments.value = [];
            }).finally(() => {
                loading.value = false;
            });
        };

        const fetchVersions = () => {
            if (!props.entityId) {
                revisions.value = [];
                selectedVersion.value = undefined;
                return;
            }

            RevisionService.getRevisionHistory(
                props.entityType,
                props.entityId
            ).then(response => {
                revisions.value = response.data;
                selectedVersion.value = versionItems.value[0];
            });
        };

        // Called from the parent when a revision row asks for its details.
        const selectVersion = (majorVersion: number, minorVersion: number) => {
            currentSubTab.value = "assessment";

            const match = versionItems.value.find(
                item => item.majorVersion === majorVersion && item.minorVersion === minorVersion);

            if (match) {
                selectedVersion.value = match;
            }
        };

        onMounted(() => fetchVersions());

        watch(() => [props.entityId, props.entityType], fetchVersions);
        watch(selectedVersion, fetchAssessments);

        return {
            currentSubTab, loading, assessments, selectedProfileIndex,
            selectedVersion, versionItems, selectedAssessment,
            failedRules, totalRules, severityColors,
            supportsRelatedQuality, supportsQualityIssues,
            versionLabelFor, scoreColorClass, selectVersion,
            downloadFullReport, showConstraintDetails,
            returnCurrentLocaleContent, displayTextOrPlaceholder, localiseDate
        };
    }
});
</script>

<style scoped>
.context-label {
    font-size: 0.75rem;
    color: rgb(var(--v-theme-on-surface));
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.context-value {
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
}

.assessment-title {
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    margin: 16px 0;
}

.dq-card {
    background-color: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.25);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.10);
}

.download-report-button {
    height: auto;
    min-height: 40px;
    padding-top: 6px;
    padding-bottom: 6px;
}

.download-report-button :deep(.v-btn__content) {
    white-space: normal;
    text-align: center;
    line-height: 1.2;
}

.score-card {
    height: 100%;
}

.score-value {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.2;
}

.constraints-title {
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    margin-bottom: 12px;
}
</style>
