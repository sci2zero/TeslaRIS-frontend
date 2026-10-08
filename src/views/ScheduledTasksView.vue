<template>
    <div class="mx-auto w-full max-w-5xl px-3 pb-6 sm:px-6">
        <h1 class="mb-6 text-3xl font-bold tracking-tight text-slate-800">
            {{ $t("scheduleTasksLabel") }}
        </h1>
        <ui-form-section :title="$t('scheduleNewTaskLabel')" icon="mdi-calendar-plus">
            <v-form v-model="isFormValid" class="space-y-5" @submit.prevent="scheduleTaskForComputation">
                <div class="max-w-xl">
                    <ui-input
                        v-model="selectedScheduledTaskType"
                        control="select"
                        :items="scheduledTaskTypes"
                        :label="$t('scheduledTaskTypeLabel')"
                    />
                </div>
                <div
                    v-if="!taskUnmanagedDocumentsDeletion"
                    class="scheduler-fields border-t border-slate-100 pt-5"
                >
                    <div
                        v-if="!taskReindexing && !journalPublicationsAssessment && !proceedingsPublicationsAssessment && !reportGeneration && !taskUnmanagedDocumentsDeletion && !publicReviewEndCheck && !maintenance && !thesesAssessment && !monographPublicationsAssessment && !metadataEnrichment && !qualityAssessmentBackfill" class="min-w-0">
                        <ui-input
                            v-model="selectedApplicableEntityType"
                            control="select"
                            :items="applicableTypes"
                            :label="$t('applicableTypeLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object
                            :readonly="false" />
                    </div>
                    <div v-if="reportGeneration" class="min-w-0">
                        <ui-input
                            v-model="selectedReportType"
                            control="select"
                            :items="reportTypes"
                            :label="$t('reportTypeLabel') + '*'"
                            :rules="requiredSelectionRules"
                            :readonly="false" />
                    </div>
                    <div v-if="taskReindexing" class="min-w-0 md:col-span-2">
                        <ui-input
                            v-model="selectedEntityTypes"
                            control="select"
                            :items="entityTypes"
                            :label="$t('entityTypeLabel') + '*'"
                            :rules="requiredMultiSelectionRules"
                            return-object
                            multiple />
                        <div class="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                            <ui-checkbox
                                v-model="reharvestCitationIndicators"
                                :label="$t('reharvestCitationIndicatorsLabel')"
                            />
                            <div class="flex items-center gap-1">
                                <ui-button
                                    variant="ghost"
                                    size="xs"
                                    @click="selectedEntityTypes = [...entityTypes]"
                                >
                                    {{ $t('selectAllLabel') }}
                                </ui-button>
                                <ui-button
                                    variant="ghost"
                                    size="xs"
                                    :disabled="selectedEntityTypes.length === 0"
                                    @click="selectedEntityTypes = []"
                                >
                                    {{ $t('deselectAllLabel') }}
                                </ui-button>
                            </div>
                        </div>
                    </div>
                    <div v-if="qualityAssessmentBackfill" class="min-w-0">
                        <ui-input
                            v-model="selectedBackfillTargets"
                            control="select"
                            :items="backfillTargets"
                            :label="$t('backfillTargetTypeLabel') + '*'"
                            :rules="requiredMultiSelectionRules"
                            return-object
                            multiple
                        />
                    </div>
                    <div v-if="qualityAssessmentBackfill" class="min-w-0">
                        <ui-input
                            v-model="selectedQualityProfile"
                            control="select"
                            :items="qualityProfiles"
                            :label="$t('qualityProfileLabel') + '*'"
                            :rules="requiredSelectionRules"
                        />
                    </div>
                    <div v-if="qualityAssessmentBackfill" class="min-w-0">
                        <ui-checkbox
                            v-model="rewriteExistingAssessments"
                            :label="$t('rewriteExistingAssessmentsLabel')"
                        />
                    </div>
                    <div v-if="publicReviewEndCheck" class="min-w-0">
                        <ui-input
                            v-model="selectedThesisTypes"
                            control="select"
                            :items="thesisTypes"
                            :label="$t('thesisTypeLabel') + '*'"
                            :rules="requiredMultiSelectionRules"
                            multiple />
                    </div>
                    <div v-if="publicReviewEndCheck" class="min-w-0">
                        <ui-input
                            v-model="publicReviewLengthDays"
                            type="number"
                            :label="$t('publicReviewLengthLabel') + '*'"
                            :placeholder="$t('publicReviewLengthLabel') + '*'"
                            :rules="requiredNumericGreaterThanZeroFieldRules"
                        />
                    </div>
                    <div v-if="publicReviewEndCheck" class="min-w-0">
                        <ui-checkbox
                            v-model="shortenedReviewPeriod"
                            :label="$t('shortenedReviewPeriodLabel')"
                        />
                    </div>
                    <div v-if="taskIndicatorLoad" class="min-w-0">
                        <ui-input
                            v-model="selectedIndicatorSource"
                            control="select"
                            :items="indicatorSources"
                            :label="$t('sourceLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object
                            :readonly="false" />
                    </div>
                    <div v-if="taskClassificationComputation || taskClassificationLoad || journalPublicationsAssessment || proceedingsPublicationsAssessment || thesesAssessment || monographPublicationsAssessment || (reportGeneration && !isSummaryReport())" class="min-w-0">
                        <commission-autocomplete-search
                            v-model="selectedCommission"
                            :only-load-commissions="taskClassificationLoad"
                            :only-classification-commissions="taskClassificationComputation"
                            :required="taskClassificationComputation || taskClassificationLoad || reportGeneration"
                        />
                    </div>
                    <div v-if="reportGeneration && isSummaryReport()" class="min-w-0">
                        <commission-autocomplete-search
                            v-model="selectedCommissions"
                            only-load-commissions
                            required
                            multiple
                        />
                    </div>
                    <div v-if="reportGeneration && isScientificProductionReport" class="min-w-0">
                        <ui-input
                            v-model="startYear"
                            control="select"
                            :items="years"
                            :label="$t('fromLabel') + '*'"
                            :rules="requiredMultiSelectionRules"
                        />
                    </div>
                    <div v-if="taskClassificationComputation || taskIF5Computation || reportGeneration" class="min-w-0">
                        <ui-input
                            v-model="selectedYears"
                            control="select"
                            :items="years"
                            :label="(reportGeneration ? $t(isScientificProductionReport ? 'toLabel' : 'reportYearLabel') : $t('yearsLabel')) + '*'"
                            :rules="requiredMultiSelectionRules"
                            :multiple="!reportGeneration" />
                    </div>
                    <div v-if="taskClassificationComputation || journalPublicationsAssessment" class="min-w-0">
                        <journal-autocomplete-search
                            v-model="selectedJournals"
                            multiple disable-submission
                        />
                    </div>
                    <div v-if="proceedingsPublicationsAssessment" class="min-w-0">
                        <event-autocomplete-search
                            v-model="selectedEvents"
                            multiple
                            disable-submission
                        />
                    </div>
                    <div v-if="monographPublicationsAssessment" class="min-w-0">
                        <monograph-autocomplete-search
                            v-model="selectedMonographs"
                            multiple
                            disable-submission
                        />
                    </div>
                    <div v-if="journalPublicationsAssessment || proceedingsPublicationsAssessment || thesesAssessment || monographPublicationsAssessment" class="min-w-0">
                        <person-autocomplete-search
                            v-model="selectedPersons"
                            multiple disable-submission
                        />
                    </div>
                    <div v-if="journalPublicationsAssessment || proceedingsPublicationsAssessment || thesesAssessment || monographPublicationsAssessment || metadataEnrichment || isTopLevelReport()" class="min-w-0">
                        <organisation-unit-autocomplete-search
                            v-model="selectedOUs" :multiple="!isTopLevelReport() || metadataEnrichment"
                            disable-submission :required="isTopLevelReport() || metadataEnrichment"
                            :label="isTopLevelReport() ? 'topLevelInstitutionLabel' : ''"
                        />
                    </div>
                    <div v-if="metadataEnrichment" class="min-w-0">
                        <ui-checkbox
                            v-model="autoload"
                            :label="$t('automaticLabel')"
                        />
                    </div>
                    <div v-if="maintenance" class="min-w-0">
                        <ui-input
                            v-model="approximateEndMoment"
                            :label="$t('approximateEndMomentLabel') + '*'"
                            :placeholder="$t('approximateEndMomentLabel')"
                            :rules="requiredFieldRules" />
                    </div>
                    <template v-if="qualityAssessmentBackfill">
                        <div class="min-w-0">
                            <person-autocomplete-search
                                v-model="selectedPersons"
                                multiple disable-submission
                            />
                        </div>
                        <div class="min-w-0">
                            <organisation-unit-autocomplete-search
                                v-model="selectedOUs"
                                multiple
                                disable-submission
                            />
                        </div>
                    </template>
                    <template v-if="taskIF5Computation">
                        <div class="min-w-0">
                            <ui-checkbox
                                v-model="calculateIF5Rank"
                                :label="$t('calculateIf5RankLabel')"
                            />
                        </div>
                        <div class="min-w-0">
                            <ui-checkbox
                                v-model="calculateJCIRank"
                                :label="$t('calculateJciRankLabel')"
                            />
                        </div>
                    </template>
                    <div v-if="taskReindexing && reindexingDocuments" class="min-w-0">
                        <p class="mb-2 text-sm text-slate-500">
                            {{ $t("publicationTypeToIndexMessage") }}
                        </p>
                        <ui-input
                            v-model="selectedPublicationType"
                            control="select"
                            :items="publicationTypes"
                            :label="$t('typeOfPublicationLabel')"
                            clearable
                            return-object />
                    </div>
                    <div
                        v-if="journalPublicationsAssessment || proceedingsPublicationsAssessment || thesesAssessment || monographPublicationsAssessment" class="min-w-0">
                        <date-picker
                            v-model="startDate"
                            :label="$t('assessmentLastModificationDateLabel') + '*'"
                            color="primary"
                            required
                        />
                    </div>
                </div>
                <div class="border-t border-slate-100 pt-5">
                    <choice-cards
                        v-model="executionMode"
                        :options="executionModeOptions"
                        :aria-label="$t('taskStartLabel')"
                    />
                </div>
                <div
                    v-if="executionMode === 'scheduled' || taskReindexing || reportGeneration || taskUnmanagedDocumentsDeletion || publicReviewEndCheck || qualityAssessmentBackfill"
                    class="scheduler-fields scheduler-timing"
                >
                    <div v-if="executionMode === 'scheduled'" class="min-w-0">
                        <date-picker
                            v-model="scheduleDate"
                            :label="$t('dateLabel') + '*'"
                            color="primary"
                            required
                            in-future
                        />
                    </div>
                    <div v-if="executionMode === 'scheduled'" class="min-w-0">
                        <time-picker v-model="scheduledTime" :label="$t('timeLabel')" required />
                    </div>
                    <div
                        v-if="taskReindexing || reportGeneration || taskUnmanagedDocumentsDeletion || publicReviewEndCheck || qualityAssessmentBackfill" class="min-w-0">
                        <ui-input
                            v-model="selectedRecurrenceType"
                            control="select"
                            :items="recurrenceTypes"
                            :label="$t('recurrenceTypeLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object />
                    </div>
                </div>
                <div class="flex justify-end border-t border-slate-100 pt-4">
                    <ui-button type="submit" :disabled="!isFormValid" class="w-full sm:w-auto">
                        <v-icon :icon="executionMode === 'now' ? 'mdi-play' : 'mdi-calendar-plus'" size="18" />
                        {{ $t(executionMode === 'now' ? 'startNowLabel' : 'scheduleLabel') }}
                    </ui-button>
                </div>
            </v-form>
        </ui-form-section>

        <section class="mt-8 border-t border-slate-200 pt-6" aria-labelledby="scheduled-tasks-heading">
            <h2 id="scheduled-tasks-heading" class="mb-4 text-lg font-semibold text-slate-800">
                {{ $t('scheduleTasksLabel') }}
            </h2>
            <scheduled-tasks-list
                :scheduled-tasks="scheduledTasks"
                @delete="deleteScheduledLoadTask" />
        </section>

        <toast v-model="snackbar" :message="message" />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import UiInput from "@/components/ui/input/Input.vue";
import ChoiceCards from "@/components/ui/choice-cards/ChoiceCards.vue";
import UiCheckbox from "@/components/ui/checkbox/Checkbox.vue";
import UiFormSection from "@/components/ui/form-section/FormSection.vue";
import { UiButton } from "@/components/ui/button";
import TimePicker from "@/components/core/TimePicker.vue";
import DatePicker from "@/components/core/DatePicker.vue";
import TaskManagerService from "@/services/TaskManagerService";
import { ApplicableEntityType, ScheduledTaskType, type ScheduledTaskResponse } from "@/models/Common";
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getApplicableEntityTypesForGivenLocale, getApplicableEntityTypeTitleFromValueAutoLocale } from "@/i18n/applicableEntityType";
import { useI18n } from "vue-i18n";
import { EntityClassificationSource, EntityIndicatorSource, ReportType } from "@/models/AssessmentModel";
import { getIndicatorSourceForGivenLocale, getIndicatorSourceTitleFromValueAutoLocale } from "@/i18n/entityIndicatorSource";
import { getErrorMessageForErrorKey } from "@/i18n";
import Toast from "@/components/core/Toast.vue";
import { getScheduledTaskTypeForGivenLocale } from "@/i18n/scheduledTaskType";
import CommissionAutocompleteSearch from "@/components/assessment/commission/CommissionAutocompleteSearch.vue";
import { AxiosError } from "axios";
import ScheduledTasksList from "@/components/core/ScheduledTasksList.vue";
import { getEntityTypeForGivenLocale } from "@/i18n/entityType";
import { EntityType } from "@/models/MergeModel";
import { getClassificationSourcesForGivenLocale, getClassificationSourceTitleFromValueAutoLocale } from "@/i18n/entityClassificationSource";
import JournalAutocompleteSearch from "@/components/journal/JournalAutocompleteSearch.vue";
import PersonAutocompleteSearch from "@/components/person/PersonAutocompleteSearch.vue";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import EventAutocompleteSearch from "@/components/event/EventAutocompleteSearch.vue";
import { PublicationType, ThesisType } from "@/models/PublicationModel";
import { getReportTypesForGivenLocale } from "@/i18n/reportType";
import { useInterval } from "@/composables/useInterval";
import { getRecurrenceTypesForGivenLocale, getRecurrenceTypeTitleFromValueAutoLocale } from "@/i18n/recurrenceType";
import { RecurrenceType } from "@/models/LoadModel";
import { getThesisTypesForGivenLocale } from "@/i18n/thesisType";
import { getPublicationTypesForGivenLocale } from "@/i18n/publicationType";
import ApplicationConfigurationService from "@/services/ApplicationConfigurationService";
import MonographAutocompleteSearch from "@/components/publication/MonographAutocompleteSearch.vue";
import { QualityAssessmentTarget } from "@/models/RevisionModel";
import { getQualityAssessmentTargetsForGivenLocale } from "@/i18n/qualityAssessmentTarget";
import DataQualityService from "@/services/revision/DataQualityService";
import { useCrisContextInformation } from "@/composables/useCrisContextInformation";
import { DateTime } from "luxon";


export default defineComponent({
    name: "ScheduledTasksView",
    components: { ChoiceCards, UiInput, UiCheckbox, UiFormSection, UiButton, TimePicker, DatePicker, Toast, CommissionAutocompleteSearch, ScheduledTasksList, JournalAutocompleteSearch, PersonAutocompleteSearch, OrganisationUnitAutocompleteSearch, EventAutocompleteSearch, MonographAutocompleteSearch },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);
        const message = ref("");

        const fiveMinutesLater = DateTime.local().plus({ minutes: 5 });
        const scheduleDate = ref(fiveMinutesLater.toISODate()!);
        const scheduledTime = ref(fiveMinutesLater.toFormat("HH:mm"));

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

        const applicableTypes = ref<{ title: string, value: ApplicableEntityType }[]>([]);
        const selectedApplicableEntityType = ref<{ title: string, value: ApplicableEntityType }>({title: getApplicableEntityTypeTitleFromValueAutoLocale(ApplicableEntityType.PUBLICATION_SERIES) as string, value: ApplicableEntityType.PUBLICATION_SERIES});

        const indicatorSources = ref<{ title: string, value: EntityIndicatorSource }[]>([]);
        const selectedIndicatorSource = ref<{ title: string, value: EntityIndicatorSource }>({title: getIndicatorSourceTitleFromValueAutoLocale(EntityIndicatorSource.WEB_OF_SCIENCE) as string, value: EntityIndicatorSource.WEB_OF_SCIENCE});

        const classificationSources = getClassificationSourcesForGivenLocale();
        const selectedClassificationSource = ref<{ title: string, value: EntityClassificationSource }>({title: getClassificationSourceTitleFromValueAutoLocale(EntityClassificationSource.MNO) as string, value: EntityClassificationSource.MNO});

        const {
            requiredSelectionRules, requiredMultiSelectionRules,
            requiredNumericGreaterThanZeroFieldRules,
            requiredFieldRules
        } = useValidationUtils();

        const i18n = useI18n();
        const executionMode = ref("scheduled");
        const executionModeOptions = computed(() => [
            {
                value: "scheduled",
                title: i18n.t("scheduledDateLabel"),
                description: i18n.t("scheduledDateDescription"),
            },
            {
                value: "now",
                title: i18n.t("startNowLabel"),
                description: i18n.t("startNowDescription"),
            },
        ]);

        const { isAssessmentModuleEnabled, isDigitalLibraryEnabled } = useCrisContextInformation();

        const assessmentOnlyTaskTypes = [
            ScheduledTaskType.INDICATOR_LOAD,
            ScheduledTaskType.IF5_JCI_COMPUTATION,
            ScheduledTaskType.CLASSIFICATION_COMPUTATION,
            ScheduledTaskType.CLASSIFICATION_LOAD,
            ScheduledTaskType.JOURNAL_PUBLICATIONS_ASSESSMENT,
            ScheduledTaskType.PROCEEDINGS_PUBLICATIONS_ASSESSMENT,
            ScheduledTaskType.THESES_ASSESSMENT,
            ScheduledTaskType.MONOGRAPH_PUBLICATIONS_ASSESSMENT,
        ];

        const digitalLibraryOnlyTaskTypes = [
            ScheduledTaskType.PUBLIC_REVIEW_END_DATE_CHECK
        ];

        const allScheduledTaskTypes = ref(getScheduledTaskTypeForGivenLocale());
        const scheduledTaskTypes = computed(() => {
            const hiddenTaskTypes = [
                ...(isAssessmentModuleEnabled.value ? [] : assessmentOnlyTaskTypes),
                ...(isDigitalLibraryEnabled.value ? [] : digitalLibraryOnlyTaskTypes)
            ];

            if (hiddenTaskTypes.length === 0) {
                return allScheduledTaskTypes.value;
            }

            return allScheduledTaskTypes.value?.filter(
                taskType => !hiddenTaskTypes.includes(taskType.value));
        });

        const selectedScheduledTaskType = ref<ScheduledTaskType>(ScheduledTaskType.INDICATOR_LOAD);

        // The default selection is itself hideable, so fall back to whatever remains available.
        watch(scheduledTaskTypes, taskTypes => {
            if (!taskTypes?.length ||
                taskTypes.some(taskType => taskType.value === selectedScheduledTaskType.value)) {
                return;
            }

            selectedScheduledTaskType.value = taskTypes[0].value;
        }, { immediate: true });

        const reportTypes = ref(getReportTypesForGivenLocale());
        const selectedReportType = ref<ReportType>(ReportType.TABLE_63);

        const taskReindexing = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.REINDEXING);
        const taskUnmanagedDocumentsDeletion = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.UNMANAGED_DOCUMENTS_DELETION);
        const taskIndicatorLoad = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.INDICATOR_LOAD);
        const taskIF5Computation = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.IF5_JCI_COMPUTATION);
        const taskClassificationComputation = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.CLASSIFICATION_COMPUTATION);
        const taskClassificationLoad = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.CLASSIFICATION_LOAD);
        const journalPublicationsAssessment = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.JOURNAL_PUBLICATIONS_ASSESSMENT);
        const proceedingsPublicationsAssessment = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.PROCEEDINGS_PUBLICATIONS_ASSESSMENT);
        const thesesAssessment = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.THESES_ASSESSMENT);
        const monographPublicationsAssessment = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.MONOGRAPH_PUBLICATIONS_ASSESSMENT);
        const reportGeneration = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.REPORT_GENERATION);
        const publicReviewEndCheck = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.PUBLIC_REVIEW_END_DATE_CHECK);
        const maintenance = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.MAINTENANCE);
        const metadataEnrichment = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.METADATA_ENRICHMENT);
        const qualityAssessmentBackfill = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.QUALITY_ASSESSMENT_BACKFILL);

        const approximateEndMoment = ref<string>("");

        const years = ref<number[]>([]);
        const startYear = ref<number>((new Date()).getFullYear() - 1);
        const selectedYears = ref<number[]>([(new Date()).getFullYear()]);

        const startDate = ref<string>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedCommission = ref<{ title: string, value: number }>(searchPlaceholder);

        const entityTypes = ref<{ title: string; value: EntityType; }[]>(getEntityTypeForGivenLocale() as { title: string; value: EntityType; }[]);
        const selectedEntityTypes = ref<{ title: string, value: EntityType }[]>([...entityTypes.value]);

        const publicationTypes = ref<{ title: string; value: PublicationType; }[]>(getPublicationTypesForGivenLocale() as { title: string; value: PublicationType; }[]);
        const selectedPublicationType = ref<{ title: string; value: PublicationType; }>();
        const reindexingDocuments = computed(() => selectedEntityTypes.value.some(el => el.value === EntityType.PUBLICATION));

        const selectedJournals = ref<{title: string, value: number}[]>([]);
        const selectedEvents = ref<{title: string, value: number}[]>([]);
        const selectedMonographs = ref<{title: string, value: number}[]>([]);
        const selectedPersons = ref<{title: string, value: number}[]>([]);
        const selectedOUs = ref<{title: string, value: number}[] | {title: string, value: number}>([]);
        const selectedCommissions = ref<{title: string, value: number}[]>([]);

        const thesisTypes = ref<{ title: string; value: ThesisType; }[]>(getThesisTypesForGivenLocale() as { title: string; value: ThesisType; }[]);
        const selectedThesisTypes = ref<{ title: string, value: ThesisType }[]>([...thesisTypes.value]);
        const publicReviewLengthDays = ref<number>(30);

        const recurrenceTypes = computed(() => getRecurrenceTypesForGivenLocale());
        const selectedRecurrenceType = ref<{title: string, value: RecurrenceType}>(
            {title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string, value: RecurrenceType.ONCE}
        );

        const reharvestCitationIndicators = ref(false);

        const backfillTargets = ref<{ title: string; value: QualityAssessmentTarget; }[]>(getQualityAssessmentTargetsForGivenLocale() as { title: string; value: QualityAssessmentTarget; }[]);
        const selectedBackfillTargets = ref<{ title: string, value: QualityAssessmentTarget }[]>([]);
        const rewriteExistingAssessments = ref(false);
        const qualityProfiles = ref<string[]>([]);
        const selectedQualityProfile = ref<string | undefined>(undefined);

        const calculateIF5Rank = ref(true);
        const calculateJCIRank = ref(false);

        const autoload = ref(true);

        const shortenedReviewPeriod = ref(false);

        onMounted(() => {
            fetchScheduledTasks();
            fetchQualityProfiles();

            populateSelectionData();

            const now = new Date();
            const secondsUntilNextMinute = 60 - now.getSeconds();
            const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000;

            for(let i = 1999; i <= now.getFullYear(); i++) {
                years.value.push(i);
            }

            document.title = `TeslaRIS - ${i18n.t("routeLabel.scheduledTasks")}`;

            setTimeout(() => {
                fetchScheduledTasks();
                startInterval();
            }, millisecondsUntilNextMinute);
        });

        watch(i18n.locale, () => {
            populateSelectionData();
        });

        const fetchQualityProfiles = () => {
            DataQualityService.listProfileNames().then(response => {
                qualityProfiles.value = [
                    ...new Set(response.data.map(profile => profile.profileName))
                ];

                if (!selectedQualityProfile.value) {
                    selectedQualityProfile.value = qualityProfiles.value[0];
                }
            });
        };

        const fetchScheduledTasks = () => {
            TaskManagerService.listScheduledTasks().then((response) => {
                scheduledTasks.value = response.data;
                scheduledTasks.value.sort((a, b) => {
                    if(!a.executionTime) {
                        return 1;
                    }

                    return a.executionTime.localeCompare(b.executionTime);
                });
            });
        };

        const { startInterval } = useInterval(fetchScheduledTasks, 1000 * 60);

        const populateSelectionData = () => {
            allScheduledTaskTypes.value = getScheduledTaskTypeForGivenLocale();
            reportTypes.value = getReportTypesForGivenLocale();
            entityTypes.value = getEntityTypeForGivenLocale() as { title: string; value: EntityType; }[];
            backfillTargets.value = getQualityAssessmentTargetsForGivenLocale() as { title: string; value: QualityAssessmentTarget; }[];
            applicableTypes.value = (getApplicableEntityTypesForGivenLocale() as { title: string, value: ApplicableEntityType }[]).filter(item => item.value === ApplicableEntityType.PUBLICATION_SERIES);
            indicatorSources.value = (getIndicatorSourceForGivenLocale() as { title: string, value: EntityIndicatorSource }[]).filter(item => item.value !== EntityIndicatorSource.MANUAL);
        };

        const scheduleTask = (taskFunction: any) => {
            taskFunction()
                .then(() => {
                    message.value = i18n.t("scheduleSuccessMessage");
                    snackbar.value = true;
                    fetchScheduledTasks();
                })
                .catch((error: AxiosError<Error>) => {
                    message.value = getErrorMessageForErrorKey(error.response?.data?.message || "defaultErrorKey");
                    snackbar.value = true;
                });
        };

        const scheduleTaskForComputation = () => {
            if (!isFormValid.value) {
                return;
            }

            // Leave a short window for the request: the scheduler rejects past timestamps.
            const timestamp = executionMode.value === "now"
                ? new Date(Date.now() + 10_000).toISOString()
                : createTimestamp(scheduleDate.value, scheduledTime.value);

            switch (selectedScheduledTaskType.value) {
                case ScheduledTaskType.INDICATOR_LOAD:
                    scheduleTask(() =>
                        TaskManagerService.scheduleIndicatorLoadingTask(
                            timestamp, selectedIndicatorSource.value.value
                        )
                    );
                    break;

                case ScheduledTaskType.IF5_JCI_COMPUTATION:
                    scheduleTask(() =>
                        TaskManagerService.scheduleIF5AndJCIRankComputationTask(
                            timestamp, selectedYears.value,
                            calculateIF5Rank.value, calculateJCIRank.value
                        )
                    );
                    break;

                case ScheduledTaskType.CLASSIFICATION_COMPUTATION:
                    scheduleTask(() =>
                        TaskManagerService.scheduleClassificationComputationTask(
                            timestamp, selectedCommission.value.value, selectedYears.value,
                            selectedJournals.value.map(journal => journal.value)
                        )
                    );
                    break;

                case ScheduledTaskType.REINDEXING:
                    scheduleTask(() =>
                        TaskManagerService.scheduleDatabaseReindexing(
                            timestamp, selectedEntityTypes.value.map(entityType => entityType.value),
                            selectedRecurrenceType.value.value,
                            reharvestCitationIndicators.value,
                            selectedPublicationType.value ? selectedPublicationType.value.value : null
                        )
                    );
                    break;

                case ScheduledTaskType.CLASSIFICATION_LOAD:
                    scheduleTask(() =>
                        TaskManagerService.scheduleClassificationLoadTask(
                            timestamp, selectedClassificationSource.value.value,
                            selectedCommission.value.value
                        )
                    );
                    break;

                case ScheduledTaskType.JOURNAL_PUBLICATIONS_ASSESSMENT:
                    scheduleTask(() =>
                        TaskManagerService.schedulePublicationAssessment(
                            timestamp, (startDate.value as string).split("T")[0],
                            {
                                commissionId: selectedCommission.value.value > 0 ? selectedCommission.value.value : null,
                                authorIds: selectedPersons.value.map(person => person.value),
                                organisationUnitIds: (selectedOUs.value as {title: string, value: number}[]).map(ou => ou.value),
                                publishedInIds: selectedJournals.value.map(journal => journal.value)
                            },
                            PublicationType.JOURNAL_PUBLICATION
                        )
                    );
                    break;

                case ScheduledTaskType.PROCEEDINGS_PUBLICATIONS_ASSESSMENT:
                    scheduleTask(() =>
                        TaskManagerService.schedulePublicationAssessment(
                            timestamp, (startDate.value as string).split("T")[0],
                            {
                                commissionId: selectedCommission.value.value > 0 ? selectedCommission.value.value : null,
                                authorIds: selectedPersons.value.map(person => person.value),
                                organisationUnitIds: (selectedOUs.value as {title: string, value: number}[]).map(ou => ou.value),
                                publishedInIds: selectedEvents.value.map(journal => journal.value)
                            },
                            PublicationType.PROCEEDINGS_PUBLICATION
                        )
                    );
                    break;

                case ScheduledTaskType.REPORT_GENERATION:
                    scheduleTask(() =>
                        TaskManagerService.scheduleReportGeneration(
                            timestamp, selectedReportType.value,
                            selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY ? selectedCommissions.value.map(commission => commission.value) : [selectedCommission.value.value],
                            selectedYears.value, (selectedOUs.value as {title: string, value: number}).value, "sr",
                            selectedRecurrenceType.value.value,
                            selectedReportType.value === ReportType.TABLE_SCIENTIFIC_PRODUCTION ? startYear.value : null
                        )
                    );
                    break;

                case ScheduledTaskType.UNMANAGED_DOCUMENTS_DELETION:
                    scheduleTask(() =>
                        TaskManagerService.scheduleUnmanagedDocumentsDeletion(
                            timestamp, selectedRecurrenceType.value.value
                        )
                    );
                    break;

                case ScheduledTaskType.PUBLIC_REVIEW_END_DATE_CHECK:
                    scheduleTask(() =>
                        TaskManagerService.schedulePublicReviewEndCheck(
                            timestamp, selectedThesisTypes.value.map(type => type.value),
                            publicReviewLengthDays.value, selectedRecurrenceType.value.value
                        )
                    );
                    break;

                case ScheduledTaskType.MAINTENANCE:
                    scheduleTask(() =>
                        ApplicationConfigurationService.scheduleMaintenence(
                            timestamp, approximateEndMoment.value
                        )
                    );
                    break;

                case ScheduledTaskType.THESES_ASSESSMENT:
                    scheduleTask(() =>
                        TaskManagerService.schedulePublicationAssessment(
                            timestamp, (startDate.value as string).split("T")[0],
                            {
                                commissionId: selectedCommission.value.value > 0 ? selectedCommission.value.value : null,
                                authorIds: selectedPersons.value.map(person => person.value),
                                organisationUnitIds: (selectedOUs.value as {title: string, value: number}[]).map(ou => ou.value),
                                publishedInIds: []
                            },
                            PublicationType.THESIS
                        )
                    );
                    break;
                case ScheduledTaskType.MONOGRAPH_PUBLICATIONS_ASSESSMENT:
                    scheduleTask(() =>
                        TaskManagerService.schedulePublicationAssessment(
                            timestamp, (startDate.value as string).split("T")[0],
                            {
                                commissionId: selectedCommission.value.value > 0 ? selectedCommission.value.value : null,
                                authorIds: selectedPersons.value.map(person => person.value),
                                organisationUnitIds: (selectedOUs.value as {title: string, value: number}[]).map(ou => ou.value),
                                publishedInIds: selectedMonographs.value.map(monograph => monograph.value)
                            },
                            PublicationType.MONOGRAPH_PUBLICATION
                        )
                    );
                    break;
                case ScheduledTaskType.METADATA_ENRICHMENT:
                    scheduleTask(() =>
                        TaskManagerService.scheduleMetadataEnrichment(
                            timestamp,
                            (selectedOUs.value as { title: string; value: number; }[]).map(ou => ou.value),
                            autoload.value,
                            selectedRecurrenceType.value.value
                        )
                    );
                    break;

                case ScheduledTaskType.QUALITY_ASSESSMENT_BACKFILL:
                    scheduleTask(() =>
                        TaskManagerService.scheduleQualityAssessmentBackfill(
                            timestamp,
                            selectedBackfillTargets.value.map(target => target.value),
                            selectedPersons.value.map(person => person.value),
                            (selectedOUs.value as { title: string; value: number; }[]).map(ou => ou.value),
                            selectedQualityProfile.value as string,
                            rewriteExistingAssessments.value,
                            selectedRecurrenceType.value.value
                        )
                    );
                    break;

                default:
                    message.value = i18n.t("invalidTaskTypeMessage");
                    snackbar.value = true;
                    break;
            }
        };

        const deleteScheduledLoadTask = (taskId: string) => {
            TaskManagerService.canceltask(taskId).then(() => {
                message.value = i18n.t("cancelSuccessMessage");
                snackbar.value = true;
                fetchScheduledTasks();
            }).catch(() => {
                message.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const createTimestamp = (date: string, time: string): string => {
            const localDate = date.split("T")[0];
            const localTime = time + ":00";
            return `${localDate}T${localTime}`;
        };

        const isTopLevelReport = () => {
            if (reportGeneration.value &&
                (
                    selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION ||
                    selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_COLORED ||
                    selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY ||
                    selectedReportType.value === ReportType.TABLE_SCIENTIFIC_PRODUCTION
                )
            ) {
                return true;
            }

            return false;
        };

        const isSummaryReport = () => {
            if (reportGeneration.value && selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY) {
                return true;
            }

            return false;
        };

        const isScientificProductionReport = computed(() =>
            selectedReportType.value === ReportType.TABLE_SCIENTIFIC_PRODUCTION);

        return {
            executionMode, executionModeOptions,
            scheduleDate, scheduledTasks, publicReviewLengthDays,
            applicableTypes, selectedApplicableEntityType,
            selectedIndicatorSource, requiredSelectionRules,
            scheduleTaskForComputation, scheduledTime,
            isFormValid, snackbar, message, years,
            deleteScheduledLoadTask, selectedOUs,
            scheduledTaskTypes, indicatorSources,
            selectedScheduledTaskType, ScheduledTaskType,
            selectedYears, selectedCommission,
            entityTypes, selectedEntityTypes,
            requiredMultiSelectionRules,
            classificationSources, startDate,
            selectedClassificationSource,
            taskReindexing, taskIndicatorLoad,
            taskIF5Computation, reportTypes,
            taskClassificationComputation,
            taskClassificationLoad, reportGeneration,
            journalPublicationsAssessment,
            selectedJournals, selectedPersons,
            proceedingsPublicationsAssessment,
            selectedEvents, selectedReportType,
            isTopLevelReport, isSummaryReport,
            selectedCommissions, recurrenceTypes,
            selectedRecurrenceType, thesisTypes,
            reharvestCitationIndicators, reindexingDocuments,
            taskUnmanagedDocumentsDeletion, publicationTypes,
            publicReviewEndCheck, selectedThesisTypes,
            requiredNumericGreaterThanZeroFieldRules,
            selectedPublicationType, maintenance,
            approximateEndMoment, requiredFieldRules,
            calculateIF5Rank, calculateJCIRank, thesesAssessment,
            monographPublicationsAssessment, selectedMonographs,
            metadataEnrichment, autoload, shortenedReviewPeriod,
            isScientificProductionReport, startYear,
            qualityAssessmentBackfill, backfillTargets,
            selectedBackfillTargets, rewriteExistingAssessments,
            qualityProfiles, selectedQualityProfile
        };
    },
});
</script>

<style scoped>
.scheduler-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 1.25rem;
}

@media (min-width: 768px) {
    .scheduler-fields {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .scheduler-timing {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
