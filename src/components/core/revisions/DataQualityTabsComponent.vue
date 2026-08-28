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
                                <v-select
                                    v-model="selectedProfileName"
                                    :items="profileNames"
                                    :label="$t('qualityProfileLabel')"
                                    density="compact"
                                    hide-details
                                />
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
                                    item-title="title"
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
                                        <div class="issue-message">
                                            {{ displayTextOrPlaceholder(
                                                returnCurrentLocaleContent(rule.message) as string) }}
                                        </div>
                                        <div
                                            v-if="rule.actualValue && rule.actualValue.length < 100"
                                            class="text-medium-emphasis text-caption">
                                            ({{ rule.actualValue }})
                                        </div>
                                    </td>
                                    <td>
                                        <v-btn
                                            density="compact"
                                            variant="text"
                                            color="primary"
                                            append-icon="mdi-arrow-right"
                                            @click="showRuleDetails(rule)">
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
            <template v-if="selectedRelatedProfile">
                <v-card class="dq-card mt-5 mb-5" variant="flat">
                    <v-card-text>
                        <v-row align="center">
                            <v-col cols="12" md="3">
                                <v-select
                                    v-model="selectedRelatedProfileName"
                                    :items="relatedProfileNames"
                                    :label="$t('qualityProfileLabel')"
                                    density="compact"
                                    hide-details
                                />
                            </v-col>
                            <v-col cols="6" md="3">
                                <div class="context-label">
                                    {{ $t("versionLabel") }}
                                </div>
                                <div class="context-value">
                                    {{ selectedRelatedProfile.profileVersion }}
                                </div>
                            </v-col>
                            <v-col cols="6" md="3">
                                <div class="context-label">
                                    {{ $t("assessmentDateLabel") }}
                                </div>
                                <div class="context-value">
                                    {{ localiseDate(selectedRelatedProfile.assessmentDate) }}
                                </div>
                            </v-col>
                            <v-col cols="12" md="3">
                                <div class="context-label">
                                    {{ $t("recordVersionLabel") }}
                                </div>
                                <div class="context-value">
                                    {{ versionLabelFor(latestVersion) }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <h3 class="assessment-title">
                    {{ $t("relatedQualityLabel") }}
                </h3>
                <div class="text-medium-emphasis mb-3 text-caption">
                    {{ $t("relatedQualityExplanationMessage") }}
                </div>

                <v-card variant="flat" class="dq-card">
                    <v-card-text>
                        <v-table density="compact">
                            <thead>
                                <tr>
                                    <th>{{ $t("entityTypeLabel") }}</th>
                                    <th>{{ $t("linkedRecordsLabel") }}</th>
                                    <th>{{ $t("affectedRecordsLabel") }}</th>
                                    <th>{{ $t("openIssuesLabel") }}</th>
                                    <th>{{ $t("averageScoreLabel") }}</th>
                                    <th>{{ $t("actionLabel") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in relatedQualityRows" :key="row.entityType">
                                    <td class="context-value">
                                        {{ $t(relatedEntityTypeLabels[row.entityType]) }}
                                    </td>
                                    <td>{{ row.supported ? row.linkedRecords : "-" }}</td>
                                    <td>{{ row.supported ? row.affectedRecords : "-" }}</td>
                                    <td>{{ row.supported ? row.openIssues : "-" }}</td>
                                    <td
                                        class="font-weight-bold"
                                        :class="scoreColorClass(row.averageScore)">
                                        {{ row.averageScore !== null && row.averageScore !== undefined
                                            ? `${row.averageScore.toFixed(1)}%` : "-" }}
                                    </td>
                                    <td>
                                        <v-btn
                                            :disabled="!row.supported || row.openIssues === 0"
                                            density="compact"
                                            variant="text"
                                            color="primary"
                                            append-icon="mdi-arrow-right"
                                            @click="openRelatedIssues(row)">
                                            {{ $t("openIssuesLabel") }}
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

        <v-tabs-window-item v-if="supportsQualityIssues" value="qualityIssues">
            <v-card v-if="selectedIssueProfileName" class="dq-card mt-5 mb-5" variant="flat">
                <v-card-text>
                    <v-row align="center">
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="selectedIssueProfileName"
                                :items="profileNames"
                                :label="$t('qualityProfileLabel')"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="context-label">
                                {{ $t("versionLabel") }}
                            </div>
                            <div class="context-value">
                                {{ issueProfileVersion }}
                            </div>
                        </v-col>
                        <v-col cols="6" md="3">
                            <div class="context-label">
                                {{ $t("assessmentDateLabel") }}
                            </div>
                            <div class="context-value">
                                {{ localiseDate(issueAssessmentDate) }}
                            </div>
                        </v-col>
                        <v-col cols="12" md="3">
                            <div class="context-label">
                                {{ $t("recordVersionLabel") }}
                            </div>
                            <div class="context-value">
                                {{ versionLabelFor(latestVersion) }}
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <h3 class="assessment-title">
                {{ $t("dataQualityIssuesLabel") }}
            </h3>

            <v-card variant="flat" class="dq-card mb-5">
                <v-card-text>
                    <v-row align="center">
                        <v-col cols="12" md="2">
                            <v-select
                                v-model="issueFilters.target"
                                :items="targetOptions"
                                :label="$t('targetEntityTypeLabel')"
                                density="compact"
                                clearable
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-select
                                v-model="issueFilters.dimension"
                                :items="dimensionOptions"
                                :label="$t('dimensionLabel')"
                                density="compact"
                                clearable
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-select
                                v-model="issueFilters.severity"
                                :items="severityOptions"
                                :label="$t('severityLabel')"
                                density="compact"
                                clearable
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-autocomplete
                                v-model="issueFilters.constraintKey"
                                :items="constraintOptions"
                                :label="$t('constraintLabel')"
                                :no-data-text="$t('noMatchingConstraintsMessage')"
                                density="compact"
                                auto-select-first
                                clearable
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="3" class="d-flex gap-2">
                            <v-btn color="primary" variant="outlined" @click="clearIssueFilters">
                                {{ $t("clearLabel") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <tab-content-loader v-if="issuesLoading" :button-header="false" layout="table" />

            <v-card v-else variant="flat" class="dq-card">
                <v-card-text>
                    <div v-if="issues.length === 0" class="text-medium-emphasis">
                        {{ $t("noFailedConstraintsMessage") }}
                    </div>

                    <template v-else>
                        <v-table density="compact">
                            <thead>
                                <tr>
                                    <th>{{ $t("affectedRecordLabel") }}</th>
                                    <th>{{ $t("targetEntityTypeLabel") }}</th>
                                    <th>{{ $t("constraintLabel") }}</th>
                                    <th>{{ $t("dimensionLabel") }}</th>
                                    <th>{{ $t("severityLabel") }}</th>
                                    <th>{{ $t("actionLabel") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="issue in issues"
                                    :key="`${issue.assessmentId}-${issue.ruleKey}`">
                                    <td class="context-value">
                                        <localized-link :to="getLandingPageBasePath(issue.entityType) + issue.entityId">
                                            {{ $i18n.locale.startsWith('sr') ? issue.entityNameSr : issue.entityNameOther }}
                                        </localized-link>
                                    </td>
                                    <td>{{ issue.target }}</td>
                                    <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(issue.title) as string) }}</td>
                                    <td>{{ issue.dimension }}</td>
                                    <td>
                                        <v-chip
                                            :color="severityColors[issue.severity]"
                                            variant="tonal"
                                            size="small">
                                            {{ issue.severity }}
                                        </v-chip>
                                    </td>
                                    <td>
                                        <v-btn
                                            density="compact"
                                            variant="text"
                                            color="primary"
                                            append-icon="mdi-arrow-right"
                                            @click="showIssueDetails(issue)">
                                            {{ $t("viewDetailsLabel") }}
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>

                        <div class="d-flex align-center justify-space-between mt-4">
                            <span class="text-medium-emphasis text-caption">
                                {{ $t("totalIssuesLabel", { count: totalIssues }) }}
                            </span>
                            <v-pagination
                                v-model="issuePage"
                                :length="issuePageCount"
                                :total-visible="5"
                                density="compact"
                            />
                        </div>
                    </template>
                </v-card-text>
            </v-card>
        </v-tabs-window-item>
    </v-tabs-window>

    <data-quality-issue-details-modal
        v-model="issueDetailsDialog"
        :assessment-id="detailsAssessmentId"
        :rule-key="detailsRuleKey"
        :record-name-sr="detailsRecordNameSr"
        :record-name-other="detailsRecordNameOther"
        :current-entity-type="entityType"
        :current-entity-id="entityId"
    />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
import {
    IssueSeverity,
    QualityDimension,
    RelatedEntityType,
    type ConstraintSummary,
    type DataQualityAssessment,
    type DataQualityIssue,
    type DataQualityProfileSummary,
    type DataQualityRuleResult,
    type ProfileRelatedQuality,
    type RelatedQuality,
    type Revision
} from "@/models/RevisionModel";
import { EntityType } from "@/models/MergeModel";
import DataQualityService from "@/services/revision/DataQualityService";
import RevisionService from "@/services/revision/RevisionService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import DataQualityIssueDetailsModal from "@/components/core/revisions/DataQualityIssueDetailsModal.vue";
import { getLandingPageBasePath } from "@/utils/PathResolutionUtil";


interface IssueFilters {
    target?: string;
    dimension?: QualityDimension;
    severity?: IssueSeverity;
    constraintKey?: string;
}

const EMPTY_ISSUE_FILTERS: IssueFilters = {
    target: undefined,
    dimension: undefined,
    severity: undefined,
    constraintKey: undefined
};

const ISSUE_PAGE_SIZE = 10;

const RELATED_ENTITY_TARGETS: Record<RelatedEntityType, string> = {
    [RelatedEntityType.OUTPUTS]: "Document",
    [RelatedEntityType.PROJECTS]: "Project",
    [RelatedEntityType.ACTIVITIES]: "Activity",
    [RelatedEntityType.FUNDINGS]: "Funding"
};

interface VersionItem {
    title: string;
    majorVersion: number;
    minorVersion: number;
}

export default defineComponent({
    name: "DataQualityTabsComponent",
    components: { TabContentLoader, LocalizedLink, DataQualityIssueDetailsModal },
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
        const relatedQuality = ref<ProfileRelatedQuality[]>([]);
        const selectedIssueProfileName = ref<string | undefined>(undefined);
        const issues = ref<DataQualityIssue[]>([]);
        const issuesLoading = ref(false);
        const issuePage = ref(1);
        const totalIssues = ref(0);
        const profiles = ref<DataQualityProfileSummary[]>([]);
        const issueFilters = ref<IssueFilters>({ ...EMPTY_ISSUE_FILTERS });
        const assessments = ref<DataQualityAssessment[]>([]);
        const selectedProfileName = ref<string | undefined>(undefined);
        const selectedRelatedProfileName = ref<string | undefined>(undefined);
        const selectedVersion = ref<VersionItem | undefined>(undefined);

        const severityColors = {
            [IssueSeverity.ERROR]: "error",
            [IssueSeverity.WARNING]: "warning",
            [IssueSeverity.INFO]: "info"
        };

        const targetOptions = Object.entries(RELATED_ENTITY_TARGETS).map(([, target]) => target);

        const relatedEntityTypeLabels: Record<RelatedEntityType, string> = {
            [RelatedEntityType.OUTPUTS]: "outputsLabel",
            [RelatedEntityType.PROJECTS]: "projectsLabel",
            [RelatedEntityType.ACTIVITIES]: "activitiesLabel",
            [RelatedEntityType.FUNDINGS]: "fundingsLabel"
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

        const failedRules = computed(() => selectedAssessment.value?.failedRulesList ?? []);

        const totalRules = computed(() =>
            (selectedAssessment.value?.passedRules ?? 0) + failedRules.value.length);

        // TODO: report generation is not implemented yet.
        const downloadFullReport = () => {
        };

        const profileNames = computed(() =>
            assessments.value.map(assessment => assessment.profileName));

        const selectedAssessment = computed<DataQualityAssessment | undefined>(() =>
            assessments.value.find(
                assessment => assessment.profileName === selectedProfileName.value));

        const relatedProfileNames = computed(() =>
            relatedQuality.value.map(profile => profile.profileName));

        const latestVersion = computed<VersionItem | undefined>(() => versionItems.value[0]);

        const selectedRelatedProfile = computed<ProfileRelatedQuality | undefined>(() =>
            relatedQuality.value.find(
                profile => profile.profileName === selectedRelatedProfileName.value));

        const issueProfile = computed(() =>
            profiles.value.find(profile => profile.profileName === selectedIssueProfileName.value));

        const issueProfileVersion = computed(() =>
            assessments.value.find(
                assessment => assessment.profileName === selectedIssueProfileName.value
            )?.profileVersion ?? issueProfile.value?.version);

        const issueAssessmentDate = computed(() =>
            assessments.value.find(
                assessment => assessment.profileName === selectedIssueProfileName.value
            )?.finishedAt);

        const issuePageCount = computed(() =>
            Math.max(1, Math.ceil(totalIssues.value / ISSUE_PAGE_SIZE)));

        const dimensionOptions = computed(() => Object.values(QualityDimension));

        const severityOptions = computed(() => Object.values(IssueSeverity));

        // The constraints of a profile are configuration, not assessment data, so they are fetched
        // on their own rather than carried along with every rule of the profile.
        const constraints = ref<ConstraintSummary[]>([]);

        const constraintOptions = computed(() =>
            constraints.value
                .map(constraint => ({
                    title: displayTextOrPlaceholder(
                        returnCurrentLocaleContent(constraint.title) as string),
                    value: constraint.key
                }))
                .sort((first, second) => first.title.localeCompare(second.title)));

        const fetchConstraints = () => {
            if (!selectedIssueProfileName.value) {
                constraints.value = [];
                return;
            }

            DataQualityService.listProfileConstraints(
                selectedIssueProfileName.value, issueFilters.value.target
            ).then(response => {
                constraints.value = response.data;
            }).catch(() => {
                constraints.value = [];
            });
        };

        const relatedQualityRows = computed(() =>
            selectedRelatedProfile.value?.relatedQuality ?? []);


        const fetchRelatedQuality = () => {
            if (!props.entityId || !supportsRelatedQuality.value) {
                relatedQuality.value = [];
                return;
            }

            DataQualityService.getRelatedQuality(
                props.entityType,
                props.entityId
            ).then(response => {
                relatedQuality.value = response.data;

                if (!relatedProfileNames.value.includes(
                    selectedRelatedProfileName.value as string)) {
                    selectedRelatedProfileName.value = relatedProfileNames.value[0];
                }
            }).catch(() => {
                relatedQuality.value = [];
                selectedRelatedProfileName.value = undefined;
            });
        };

        const resetPageAndFetchIssues = () => {
            if (issuePage.value !== 1) {
                issuePage.value = 1;
                return;
            }

            fetchIssues();
        };

        const openRelatedIssues = (row: RelatedQuality) => {
            const target = RELATED_ENTITY_TARGETS[row.entityType];
            const alreadyFiltered = issueFilters.value.target === target &&
                !issueFilters.value.dimension && !issueFilters.value.severity &&
                !issueFilters.value.constraintKey;

            issueFilters.value = { ...EMPTY_ISSUE_FILTERS, target };
            currentSubTab.value = "qualityIssues";

            if (alreadyFiltered) {
                resetPageAndFetchIssues();
            }
        };

        const clearIssueFilters = () => {
            issueFilters.value = { ...EMPTY_ISSUE_FILTERS };
        };

        const issueDetailsDialog = ref(false);
        const detailsAssessmentId = ref<number | undefined>(undefined);
        const detailsRuleKey = ref<string | undefined>(undefined);
        const detailsRecordNameSr = ref("");
        const detailsRecordNameOther = ref("");

        const showIssueDetails = (issue: DataQualityIssue) => {
            detailsAssessmentId.value = issue.assessmentId;
            detailsRuleKey.value = issue.ruleKey;
            detailsRecordNameSr.value = issue.entityNameSr;
            detailsRecordNameOther.value = issue.entityNameOther;
            issueDetailsDialog.value = true;
        };

        const showRuleDetails = (rule: DataQualityRuleResult) => {
            if (!selectedAssessment.value) {
                return;
            }

            detailsAssessmentId.value = selectedAssessment.value.assessmentId;
            detailsRuleKey.value = rule.key;
            detailsRecordNameSr.value = "";
            detailsRecordNameOther.value = "";
            issueDetailsDialog.value = true;
        };

        const fetchIssues = () => {
            if (!props.entityId || !selectedIssueProfileName.value ||
                !supportsQualityIssues.value) {
                issues.value = [];
                totalIssues.value = 0;
                return;
            }

            issuesLoading.value = true;

            DataQualityService.getIssuesForEntity(
                props.entityType,
                props.entityId,
                selectedIssueProfileName.value,
                issueFilters.value.target,
                issueFilters.value.dimension,
                issueFilters.value.severity,
                issueFilters.value.constraintKey,
                issuePage.value - 1,
                ISSUE_PAGE_SIZE
            ).then(response => {
                issues.value = response.data.content;
                totalIssues.value = response.data.totalElements;
            }).catch(() => {
                issues.value = [];
                totalIssues.value = 0;
            }).finally(() => {
                issuesLoading.value = false;
            });
        };

        const fetchProfiles = () => {
            if (!supportsQualityIssues.value) {
                return;
            }

            DataQualityService.listProfileNames().then(response => {
                profiles.value = response.data;
            }).catch(() => {
                profiles.value = [];
            });
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
                selectedProfileName.value = undefined;
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

                if (!profileNames.value.includes(selectedProfileName.value as string)) {
                    selectedProfileName.value = profileNames.value[0];
                }

                if (!profileNames.value.includes(selectedIssueProfileName.value as string)) {
                    selectedIssueProfileName.value = profileNames.value[0];
                    fetchIssues();
                }
            }).catch(() => {
                assessments.value = [];
                selectedProfileName.value = undefined;
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

        onMounted(() => {
            fetchVersions();
            fetchRelatedQuality();
            fetchProfiles();
        });

        watch(() => [props.entityId, props.entityType], () => {
            fetchVersions();
            fetchRelatedQuality();
            fetchProfiles();
        });

        watch(selectedIssueProfileName, () => {
            fetchConstraints();
            resetPageAndFetchIssues();
        });

        watch(issuePage, fetchIssues);

        watch(() => issueFilters.value.target, fetchConstraints);

        watch(issueFilters, () => {
            const constraintKey = issueFilters.value.constraintKey;

            if (constraintKey &&
                !constraintOptions.value.some(option => option.value === constraintKey)) {
                issueFilters.value.constraintKey = undefined;
                return;
            }

            resetPageAndFetchIssues();
        }, { deep: true });
        watch(selectedVersion, fetchAssessments);

        return {
            currentSubTab, loading, assessments, getLandingPageBasePath,
            selectedVersion, versionItems, selectedAssessment,
            selectedProfileName, profileNames, failedRules,
            supportsRelatedQuality, supportsQualityIssues,
            versionLabelFor, scoreColorClass, selectVersion,
            relatedQuality, relatedEntityTypeLabels, openRelatedIssues,
            selectedRelatedProfile, relatedQualityRows, displayTextOrPlaceholder,
            selectedIssueProfileName, issues, issuesLoading, issuePage, issuePageCount,
            totalIssues, issueFilters, issueProfileVersion, issueAssessmentDate,
            targetOptions, dimensionOptions, severityOptions, constraintOptions,
            clearIssueFilters, showIssueDetails, selectedRelatedProfileName, 
            relatedProfileNames, latestVersion, downloadFullReport,
            returnCurrentLocaleContent, localiseDate, totalRules, severityColors,
            issueDetailsDialog, detailsAssessmentId, detailsRuleKey,
            detailsRecordNameSr, detailsRecordNameOther, showRuleDetails
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

/* A rule that fails more than once per record has its messages merged with blank lines between
   them, and HTML would otherwise collapse those into single spaces. */
.issue-message {
    white-space: pre-line;
}
</style>
