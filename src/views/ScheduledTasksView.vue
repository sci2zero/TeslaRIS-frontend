<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("scheduleTasksLabel") }}
    </h1>
    <v-row class="d-flex flex-row justify-center mt-10">
        <v-col cols="12" sm="3" md="2">
            <v-select
                v-model="selectedScheduledTaskType"
                :items="scheduledTaskTypes"
                :label="$t('scheduledTaskTypeLabel')"
                :readonly="false">
            </v-select>
        </v-col>
    </v-row>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center mt-5 bg-grey-lighten-5">
            <v-col
                v-if="!taskReindexing && !journalPublicationsAssessment && !proceedingsPublicationsAssessment && !reportGeneration && !taskUnmanagedDocumentsDeletion && !publicReviewEndCheck && !maintenance"
                cols="12" sm="3" md="2">
                <v-select
                    v-model="selectedApplicableEntityType"
                    :items="applicableTypes"
                    :label="$t('applicableTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    :class="taskClassificationComputation ? 'comfortable' : ''"
                    return-object
                    :readonly="false">
                </v-select>
            </v-col>
            <v-col v-if="reportGeneration" cols="12" sm="3" md="2">
                <v-select
                    v-model="selectedReportType"
                    :items="reportTypes"
                    :label="$t('reportTypeLabel') + '*'"
                    :class="isSummaryReport() ? 'comfortable' : ''"
                    :rules="requiredSelectionRules"
                    :readonly="false">
                </v-select>
            </v-col>
            <v-col v-if="taskReindexing" cols="8" md="4">
                <v-select
                    v-model="selectedEntityTypes"
                    :items="entityTypes"
                    :label="$t('entityTypeLabel') + '*'"
                    :rules="requiredMultiSelectionRules"
                    return-object
                    multiple>
                </v-select>
            </v-col>
            <v-col v-if="taskReindexing" cols="4" md="2">
                <v-checkbox
                    v-model="reharvestCitationIndicators"
                    class="mt-2"
                    :label="$t('reharvestCitationIndicatorsLabel')"
                ></v-checkbox>
            </v-col>
            <v-col v-if="publicReviewEndCheck" cols="10" md="6">
                <v-select
                    v-model="selectedThesisTypes"
                    :items="thesisTypes"
                    :label="$t('thesisTypeLabel') + '*'"
                    :rules="requiredMultiSelectionRules"
                    multiple>
                </v-select>
            </v-col>
            <v-col v-if="publicReviewEndCheck" cols="3" md="2">
                <v-text-field
                    v-model="publicReviewLengthDays"
                    type="number"
                    :label="$t('publicReviewLengthLabel') + '*'"
                    :placeholder="$t('publicReviewLengthLabel') + '*'"
                    :rules="requiredNumericGreaterThanZeroFieldRules"
                ></v-text-field>
            </v-col>
            <v-col v-if="taskIndicatorLoad" cols="12" sm="3" md="2">
                <v-select
                    v-model="selectedIndicatorSource"
                    :items="indicatorSources"
                    :label="$t('sourceLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="false">
                </v-select>
            </v-col>
            <!-- <v-col v-if="taskClassificationLoad" cols="2">
                <v-select
                    v-model="selectedClassificationSource"
                    :items="classificationSources"
                    :label="$t('sourceLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="false">
                </v-select>
            </v-col> -->
            <v-col v-if="taskClassificationComputation || taskClassificationLoad || journalPublicationsAssessment || proceedingsPublicationsAssessment || (reportGeneration && !isSummaryReport())" cols="12" sm="3" md="2">
                <commission-autocomplete-search 
                    v-model="selectedCommission" 
                    :only-load-commissions="taskClassificationLoad" 
                    :only-classification-commissions="taskClassificationComputation"
                    :comfortable="taskClassificationComputation || journalPublicationsAssessment || proceedingsPublicationsAssessment"
                    :required="taskClassificationComputation || taskClassificationLoad || reportGeneration"
                />
            </v-col>
            <v-col v-if="reportGeneration && isSummaryReport()" cols="12" sm="3" md="2">
                <commission-autocomplete-search 
                    v-model="selectedCommissions" 
                    only-load-commissions
                    required
                    multiple
                />
            </v-col>
            <v-col v-if="taskClassificationComputation || taskIF5Computation || reportGeneration" cols="12" sm="3" md="2">
                <v-select
                    v-model="selectedYears"
                    :items="years"
                    :label="(reportGeneration ? $t('reportYearLabel') : $t('yearsLabel')) + '*'"
                    :rules="requiredMultiSelectionRules"
                    :class="(taskClassificationComputation || isSummaryReport()) ? 'comfortable' : ''"
                    :multiple="!reportGeneration">
                </v-select>
            </v-col>
            <v-col v-if="taskClassificationComputation || journalPublicationsAssessment" cols="12" md="3">
                <journal-autocomplete-search
                    v-model="selectedJournals"
                    multiple disable-submission
                />
            </v-col>
            <v-col v-if="proceedingsPublicationsAssessment" cols="12" md="3">
                <event-autocomplete-search
                    v-model="selectedEvents"
                    multiple
                    disable-submission
                />
            </v-col>
            <v-col v-if="journalPublicationsAssessment || proceedingsPublicationsAssessment" cols="12" md="3">
                <person-autocomplete-search
                    v-model="selectedPersons"
                    multiple disable-submission
                />
            </v-col>
            <v-col v-if="journalPublicationsAssessment || proceedingsPublicationsAssessment || isTopLevelReport()" cols="12" md="3">
                <organisation-unit-autocomplete-search
                    v-model="selectedOUs" :multiple="!isTopLevelReport()"
                    disable-submission :required="isTopLevelReport()"
                    :comfortable="isSummaryReport()"
                    :label="isTopLevelReport() ? 'topLevelInstitutionLabel' : ''"
                />
            </v-col>
            <v-col v-if="maintenance" cols="12" md="4">
                <v-text-field
                    v-model="approximateEndMoment"
                    :label="$t('approximateEndMomentLabel') + '*'"
                    :placeholder="$t('approximateEndMomentLabel')"
                    outlined
                    :rules="requiredFieldRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row 
            v-if="taskIF5Computation"
            class="d-flex flex-row justify-center bg-grey-lighten-5">
            <v-col cols="2" md="2">
                <v-checkbox
                    v-model="calculateIF5Rank"
                    class="mt-2"
                    :label="$t('calculateIf5RankLabel')"
                ></v-checkbox>
            </v-col>
            <v-col cols="2" md="2">
                <v-checkbox
                    v-model="calculateJCIRank"
                    class="mt-2"
                    :label="$t('calculateJciRankLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row
            v-if="taskReindexing && reindexingDocuments"
            class="d-flex flex-row justify-center mt-5 bg-grey-lighten-5">
            <v-col cols="2" md="2">
                <h5>
                    {{ $t("publicationTypeToIndexMessage") }}
                </h5>
            </v-col>
            <v-col cols="4" md="2">
                <v-select
                    v-model="selectedPublicationType"
                    :items="publicationTypes"
                    :label="$t('typeOfPublicationLabel')"
                    clearable
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-row class="d-flex flex-row justify-center mb-5">
            <v-col v-if="journalPublicationsAssessment || proceedingsPublicationsAssessment" cols="12" sm="3" md="2">
                <date-picker
                    v-model="startDate"
                    :label="$t('startDateLabel') + '*'"
                    color="primary"
                    required
                />
            </v-col>
            <v-col cols="12" sm="3" md="2">
                <date-picker
                    v-model="scheduleDate"
                    :label="$t('dateLabel') + '*'"
                    color="primary"
                    required
                    in-future
                />
            </v-col>
            <v-col cols="12" sm="3" md="1">
                <time-picker v-model="scheduledTime" :label="$t('timeLabel')" required></time-picker>
            </v-col>
            <v-col
                v-if="taskReindexing || reportGeneration || taskUnmanagedDocumentsDeletion || publicReviewEndCheck"
                cols="12" sm="3" md="2">
                <v-select
                    v-model="selectedRecurrenceType"
                    :items="recurrenceTypes"
                    :label="$t('recurrenceTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
            </v-col>
            <v-col cols="12" sm="3" md="1">
                <v-btn class="mt-3" :disabled="!isFormValid" @click="scheduleTaskForComputation">
                    {{ $t("scheduleLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-form>

    <scheduled-tasks-list
        class="mt-10! mb-5!"
        :scheduled-tasks="scheduledTasks"
        @delete="deleteScheduledLoadTask">
    </scheduled-tasks-list>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
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


export default defineComponent({
    name: "IndicatorsLoadView",
    components: { TimePicker, DatePicker, Toast, CommissionAutocompleteSearch, ScheduledTasksList, JournalAutocompleteSearch, PersonAutocompleteSearch, OrganisationUnitAutocompleteSearch, EventAutocompleteSearch },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);
        const message = ref("");

        const now = new Date();
        const fiveMinutesLater = new Date(
            now.getTime() + 5 * 60000 - (now.getTimezoneOffset() * 60000)
        );
        const scheduleDate = ref(fiveMinutesLater.toISOString().split('T')[0]);
        const scheduledTime = ref(fiveMinutesLater.toISOString().split('T')[1].slice(0, 5));

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

        const scheduledTaskTypes = ref(getScheduledTaskTypeForGivenLocale());
        const selectedScheduledTaskType = ref<ScheduledTaskType>(ScheduledTaskType.INDICATOR_LOAD);

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
        const reportGeneration = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.REPORT_GENERATION);
        const publicReviewEndCheck = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.PUBLIC_REVIEW_END_DATE_CHECK);
        const maintenance = computed(() => selectedScheduledTaskType.value === ScheduledTaskType.MAINTENANCE);

        const approximateEndMoment = ref<string>("");

        const years = ref<number[]>([]);
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

        const calculateIF5Rank = ref(true);
        const calculateJCIRank = ref(false);

        onMounted(() => {
            fetchScheduledTasks();

            populateSelectionData();
            
            const now = new Date();
            const secondsUntilNextMinute = 60 - now.getSeconds();
            const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000;

            for(let i = 1999; i <= now.getFullYear(); i++) {
                years.value.push(i);
            }

            document.title = `TeslaRIS - ${i18n.t("routeLabel.scheduledTasks")}}`;

            setTimeout(() => {
                fetchScheduledTasks();
                startInterval();
            }, millisecondsUntilNextMinute);
        });

        watch(i18n.locale, () => {
            populateSelectionData();
        });

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
            scheduledTaskTypes.value = getScheduledTaskTypeForGivenLocale();
            reportTypes.value = getReportTypesForGivenLocale();
            entityTypes.value = getEntityTypeForGivenLocale() as { title: string; value: EntityType; }[];
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
            const timestamp = createTimestamp(scheduleDate.value, scheduledTime.value);

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
                            selectedRecurrenceType.value.value
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
                    selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY
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

        return {
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
            calculateIF5Rank, calculateJCIRank
        };
    },
});
</script>
