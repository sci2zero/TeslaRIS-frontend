<template>
    <v-data-table-server
        :sort-by="tableOptions.sortBy"
        :items="pagedRevisions"
        :headers="headers"
        :items-length="revisions.length"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 25, 50]"
        :items-per-page="25"
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-btn
                        :icon="isExpanded(row.item) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                        :disabled="!isExpandable(row.item)"
                        density="compact"
                        variant="text"
                        @click="toggleRow(row.item)"
                    />
                </td>
                <td>{{ row.item.majorVersion }}.{{ row.item.minorVersion }}</td>
                <td>{{ localiseDate(row.item.timestamp) }}</td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.versionNote ? $t(row.item.versionNote.split(":")[0] + "Message", [row.item.versionNote.split(":").at(-1)]) : row.item.versionNote as string) }}
                    <v-chip
                        v-if="restorationWarnings(row.item).length > 0"
                        class="ml-2"
                        color="warning"
                        variant="tonal"
                        size="x-small"
                        prepend-icon="mdi-alert-outline"
                        @click="toggleRow(row.item)">
                        {{ $t("restorationWarningsCountLabel", { count: restorationWarnings(row.item).length }) }}
                    </v-chip>
                </td>
                <td>{{ displayTextOrPlaceholder(row.item.createdBy as string) }}</td>
                <td>
                    <span
                        v-if="row.item.assessments.length === 0"
                        class="text-medium-emphasis">
                        {{ $t("noAssessmentsLabel") }}
                    </span>
                    <template v-else>
                        <span :class="scoreColorClass(bestAssessment(row.item)?.dataQualityScore)">
                            <strong>{{ bestAssessment(row.item)?.dataQualityScore.toFixed(1) }}%</strong>
                        </span>
                        <span class="text-medium-emphasis">
                            ({{ bestAssessment(row.item)?.profileName }})
                        </span>
                        <span class="text-medium-emphasis">
                            &middot; {{ $t("totalAssessmentsLabel", { count: row.item.assessments.length }) }}
                        </span>
                    </template>
                </td>
                <td>
                    <v-btn
                        density="compact"
                        variant="text"
                        color="primary"
                        @click="showDetailedAssessment(row.item)">
                        {{ $t("detailedAssessmentLabel") }}
                    </v-btn>
                    <v-btn
                        v-if="!isLatestRevision(row.item)"
                        density="compact"
                        variant="text"
                        color="primary"
                        :loading="restoreInProgress"
                        @click="startRestoreProcess(row.item)">
                        {{ $t("restoreRevisionLabel") }}
                    </v-btn>
                </td>
            </tr>
            <tr v-if="isExpanded(row.item)">
                <td :colspan="headers.length" class="assessment-panel">
                    <template v-if="restorationWarnings(row.item).length > 0">
                        <div class="panel-title">
                            {{ $t("restorationWarningsLabel") }}
                        </div>
                        <div class="text-medium-emphasis mb-2 text-caption">
                            {{ $t("restorationWarningsExplanationMessage") }}
                        </div>
                        <v-table density="compact" class="mb-4">
                            <thead>
                                <tr>
                                    <th>{{ $t("statusLabel") }}</th>
                                    <th>{{ $t("descriptionLabel") }}</th>
                                    <th>{{ $t("fieldLabel") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(warning, warningIndex) in restorationWarnings(row.item)"
                                    :key="`${warning.fieldPath}-${warningIndex}`">
                                    <td>
                                        <v-chip
                                            :color="warning.outcome === DegradationOutcome.DEGRADED ? 'warning' : 'error'"
                                            variant="tonal"
                                            size="small">
                                            {{ warning.outcome === DegradationOutcome.DEGRADED
                                                ? $t("referenceDegradedLabel")
                                                : $t("referenceDroppedLabel") }}
                                        </v-chip>
                                    </td>
                                    <td>{{ $t(warning.messageKey, warning.parameters) }}</td>
                                    <td class="text-medium-emphasis">
                                        {{ warning.fieldPath }}
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </template>

                    <div v-if="row.item.assessments.length > 0" class="panel-title">
                        {{ $t("dataQualityAssessmentLabel") }}
                    </div>
                    <v-table v-if="row.item.assessments.length > 0" density="compact">
                        <thead>
                            <tr>
                                <th>{{ $t("qualityProfileLabel") }}</th>
                                <th>{{ $t("qualityScoreLabel") }}</th>
                                <th>{{ $t("statusLabel") }}</th>
                                <th>{{ $t("assessmentDateLabel") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(assessment, assessmentIndex) in sortedAssessments(row.item)"
                                :key="`${assessment.profileName}-${assessment.profileVersion}`">
                                <td>
                                    {{ assessment.profileName }} {{ assessment.profileVersion }}
                                    <v-chip
                                        v-if="assessmentIndex === 0 && sortedAssessments(row.item).length > 1"
                                        class="ml-2"
                                        variant="tonal"
                                        size="x-small"
                                        color="primary">
                                        {{ $t("bestAssessmentLabel") }}
                                    </v-chip>
                                </td>
                                <td :class="scoreColorClass(assessment.dataQualityScore)">
                                    {{ assessment.dataQualityScore.toFixed(1) }}%
                                </td>
                                <td>
                                    <v-chip
                                        :color="assessment.publicationCandidate ? 'success' : 'warning'"
                                        variant="tonal"
                                        size="small">
                                        {{ assessment.publicationCandidate
                                            ? $t("publicationCandidateLabel")
                                            : $t("needsRevisionLabel") }}
                                    </v-chip>
                                </td>
                                <td>{{ localiseDate(assessment.assessmentDate) }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </td>
            </tr>
        </template>
    </v-data-table-server>

    <div class="notificationContainer">
        <v-slide-y-transition group>
            <v-alert
                v-for="notification in notifications"
                :key="notification[0]"
                theme="dark"
            >
                {{ notification[1] }}
            </v-alert>
        </v-slide-y-transition>
    </div>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmRevisionRestoreMessage')"
        :entity-names="revisionToRestore ? [versionLabelFor(revisionToRestore)] : []"
        @continue="restoreRevision">
    </persistent-question-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { DegradationOutcome, type DataQualityAssessmentSimple, type DegradedReference, type Revision } from "@/models/RevisionModel";
import RevisionService from "@/services/revision/RevisionService";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";


export default defineComponent({
    name: "RevisionHistoryTableComponent",
    components: { PersistentQuestionDialog },
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
    emits: ["restored"],
    setup(props, { emit }) {
        const revisions = ref<Revision[]>([]);
        const expandedRows = ref<Set<string>>(new Set());
        const notifications = ref<Map<string, string>>(new Map());

        const displayPersistentDialog = ref(false);
        const revisionToRestore = ref<Revision | undefined>(undefined);
        const restoreInProgress = ref(false);

        const i18n = useI18n();

        const versionLabel = computed(() => i18n.t("versionLabel"));
        const dateLabel = computed(() => i18n.t("dateLabel"));
        const versionNoteLabel = computed(() => i18n.t("versionNoteLabel"));
        const createdByLabel = computed(() => i18n.t("createdByLabel"));
        const assessmentsLabel = computed(() => i18n.t("dataQualityAssessmentLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const headers = ref<any[]>([
            { title: "", align: "start", sortable: false, width: "48px" },
            { title: versionLabel, align: "start", sortable: false },
            { title: dateLabel, align: "start", sortable: false },
            { title: versionNoteLabel, align: "start", sortable: false },
            { title: createdByLabel, align: "start", sortable: false },
            { title: assessmentsLabel, align: "start", sortable: false },
            { title: actionLabel, align: "start", sortable: false }
        ]);

        const tableOptions = ref<any>({
            page: 1,
            itemsPerPage: 25,
            sortBy: []
        });

        const pagedRevisions = computed(() => {
            const start = (tableOptions.value.page - 1) * tableOptions.value.itemsPerPage;
            return revisions.value.slice(start, start + tableOptions.value.itemsPerPage);
        });

        const getContent = () => {
            if (!props.entityId) {
                revisions.value = [];
                return;
            }

            RevisionService.getRevisionHistory(
                props.entityType, props.entityId
            ).then(response => {
                revisions.value = response.data;
                tableOptions.value.page = 1;
                expandedRows.value.clear();
            });
        };

        const refreshTable = (event: any) => {
            tableOptions.value = event;
            expandedRows.value.clear();
        };

        const rowKey = (revision: Revision) =>
            `${revision.timestamp}-${revision.majorVersion}.${revision.minorVersion}`;

        const isExpanded = (revision: Revision) => expandedRows.value.has(rowKey(revision));

        const toggleRow = (revision: Revision) => {
            const key = rowKey(revision);

            if (expandedRows.value.has(key)) {
                expandedRows.value.delete(key);
            } else {
                expandedRows.value.add(key);
            }
        };

        const restorationWarnings = (revision: Revision): DegradedReference[] =>
            revision.restorationWarnings ?? [];

        const isExpandable = (revision: Revision) =>
            revision.assessments.length > 0 || restorationWarnings(revision).length > 0;

        // Revisions arrive sorted by timestamp, newest first.
        const isLatestRevision = (revision: Revision) =>
            revisions.value.length > 0 && rowKey(revisions.value[0]) === rowKey(revision);

        const assessmentsByScore = computed(() => {
            const byRow = new Map<string, DataQualityAssessmentSimple[]>();

            revisions.value.forEach(revision => byRow.set(
                rowKey(revision),
                [...revision.assessments].sort((a, b) => b.dataQualityScore - a.dataQualityScore)
            ));

            return byRow;
        });

        const sortedAssessments = (revision: Revision) =>
            assessmentsByScore.value.get(rowKey(revision)) ?? [];

        const bestAssessment = (revision: Revision): DataQualityAssessmentSimple | undefined =>
            sortedAssessments(revision)[0];

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

        // TODO: not wired to an action yet.
        const showDetailedAssessment = (revision: Revision) => {
            console.log("Detailed assessment requested for revision", revision.timestamp);
        };

        const versionLabelFor = (revision: Revision) =>
            `${revision.majorVersion}.${revision.minorVersion}`;

        const startRestoreProcess = (revision: Revision) => {
            revisionToRestore.value = revision;
            displayPersistentDialog.value = true;
        };

        const restoreRevision = () => {
            if (!props.entityId || !revisionToRestore.value) {
                return;
            }

            const revision = revisionToRestore.value;
            restoreInProgress.value = true;

            RevisionService.restoreRevision(
                props.entityType,
                props.entityId,
                revision.majorVersion,
                revision.minorVersion
            ).then(() => {
                addNotification(i18n.t("revisionRestoredMessage",
                    { version: versionLabelFor(revision) }));

                emit("restored");
                getContent();
            }).catch((error) => {
                const message = error.response?.data?.message;

                if (message?.startsWith("cantRestoreVersionMessage")) {
                    const params = message.split(":");

                    addNotification(
                        i18n.t("cantRestoreVersionMessage", [params[1], params[2]])
                    );
                } else {
                    addNotification(i18n.t("genericErrorMessage"));
                }
            }).finally(() => {
                restoreInProgress.value = false;
                revisionToRestore.value = undefined;
            });
        };

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => notifications.value.delete(notificationId), 4000);
        };

        onMounted(() => getContent());

        watch(
            () => [props.entityId, props.entityType],
            getContent
        );

        return {
            revisions, pagedRevisions, headers, tableOptions,
            refreshTable, isExpanded, toggleRow, scoreColorClass,
            sortedAssessments, bestAssessment, isLatestRevision,
            restorationWarnings, isExpandable, DegradationOutcome,
            showDetailedAssessment, startRestoreProcess, restoreRevision,
            displayPersistentDialog, revisionToRestore, restoreInProgress,
            notifications, versionLabelFor,
            displayTextOrPlaceholder, localiseDate
        };
    }
});
</script>

<style scoped>
.assessment-panel {
    padding: 8px 16px 16px 48px;
    background-color: rgb(var(--v-theme-surface-light));
}

.panel-title {
    font-weight: 600;
    margin-bottom: 4px;
}
</style>
