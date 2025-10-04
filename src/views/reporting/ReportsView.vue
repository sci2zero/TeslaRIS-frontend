<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("reportingLabel") }}
    </h1>
    <v-tabs
        v-model="currentTab"
        bg-color="blue-grey-lighten-5"
        color="deep-purple-accent-4"
        align-tabs="center"
    >
        <v-tab value="scheduling">
            {{ $t("scheduleTasksLabel") }}
        </v-tab>
        <v-tab value="generated">
            {{ $t("generatedReportsLabel") }}
        </v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
        <v-tabs-window-item value="scheduling">
            <v-form v-model="isFormValid" @submit.prevent>
                <v-row class="d-flex flex-row justify-center mt-5 bg-grey-lighten-5">
                    <v-col cols="12" sm="3" md="2">
                        <v-select
                            v-model="selectedReportType"
                            :items="reportTypes"
                            :label="$t('reportTypeLabel') + '*'"
                            :class="isSummaryReport() ? 'comfortable' : ''"
                            :rules="requiredSelectionRules">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3" md="2">
                        <commission-autocomplete-search
                            v-model="selectedCommissions"
                            only-load-commissions
                            required
                            :multiple="isSummaryReport()">
                        </commission-autocomplete-search>
                    </v-col>
                    <v-col v-if="isTopLevelReport()" cols="12" sm="3" md="3">
                        <organisation-unit-autocomplete-search
                            v-model="selectedOUs" :multiple="!isTopLevelReport()" disable-submission :required="isTopLevelReport()"
                            :comfortable="isSummaryReport()" :label="isTopLevelReport() ? 'topLevelInstitutionLabel' : ''"></organisation-unit-autocomplete-search>
                    </v-col>
                    <v-col cols="12" sm="3" md="2">
                        <v-text-field
                            v-model="selectedYear"
                            type="number"
                            :max="(new Date()).getFullYear()"
                            :label="$t('reportYearLabel') + '*'"
                            :placeholder="$t('reportYearLabel') + '*'"
                            :rules="requiredNumericFieldRules"
                            :class="isSummaryReport() ? 'comfortable' : ''"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row
                    v-if="selectedRecurrenceType.value != RecurrenceType.ONCE"
                    class="d-flex flex-row justify-center bg-grey-lighten-5">
                    <v-col cols="12" md="4">
                        <relative-date-preview
                            :start-year="selectedYear"
                            :recurrence-period="selectedRecurrenceType.value"
                        />
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center bg-grey-lighten-5">
                    <v-col cols="12" sm="4" md="3">
                        <v-select
                            v-model="selectedRecurrenceType"
                            :items="recurrenceTypes"
                            :label="$t('recurrenceTypeLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3" md="1">
                        <v-btn class="mt-3" :disabled="!isFormValid" @click="scheduleReportGeneration">
                            {{ $t("scheduleLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>

            <h2 v-if="generatedReports.length > 0" class="d-flex flex-row justify-center" mt-10>
                {{ $t("alreadyGeneratedReportsLabel") }}
            </h2>

            <v-row v-if="generatedReports.length > 0" class="d-flex flex-row justify-center mt-5 bg-grey-lighten-5">
                <v-list
                    :lines="false"
                    density="comfortable"
                    class="bigger-font"
                >
                    <v-list-item
                        v-for="generatedReport in generatedReports" :key="generatedReport.name"
                        :value="generatedReport.value"
                    >
                        <v-list-item-title @click="downloadReport(generatedReport.name, generatedReport.value)">
                            {{ generatedReport.name }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-row>

            <scheduled-tasks-list
                class="mt-10"
                :scheduled-tasks="scheduledTasks"
                @delete="deleteScheduledLoadTask">
            </scheduled-tasks-list>
        </v-tabs-window-item>
        <v-tabs-window-item value="generated">
            <h2
                v-if="generatedReports.length === 0"
                class="d-flex fler-row justify-center mt-10">
                {{ $t("noDataInTableMessage") }}
            </h2>

            <v-list
                :lines="false"
                density="comfortable"
                class="bigger-font"
            >
                <v-list-item
                    v-for="generatedReport in allGeneratedReports" :key="generatedReport.name"
                    :value="generatedReport.value"
                >
                    <v-list-item-title @click="downloadReport(generatedReport.name, generatedReport.value)">
                        {{ generatedReport.name }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-tabs-window-item>
    </v-tabs-window>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import CommissionAutocompleteSearch from '@/components/assessment/commission/CommissionAutocompleteSearch.vue';
import { getReportTypesForGivenLocale } from '@/i18n/reportType';
import { type ErrorResponse, type ScheduledTaskResponse } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { useValidationUtils } from '@/utils/ValidationUtils';
import TaskManagerService from '@/services/TaskManagerService';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import ReportingService from '@/services/assessment/ReportingService';
import ScheduledTasksList from '@/components/core/ScheduledTasksList.vue';
import Toast from '@/components/core/Toast.vue';
import { AxiosError } from 'axios';
import { ReportType } from '@/models/AssessmentModel';
import { useInterval } from '@/composables/useInterval';
import { getRecurrenceTypesForGivenLocale, getRecurrenceTypeTitleFromValueAutoLocale } from '@/i18n/recurrenceType';
import { RecurrenceType } from '@/models/LoadModel';
import RelativeDatePreview from '@/components/core/RelativeDatePreview.vue';


export default defineComponent({
    name: "ViewIndicatorsComponent",
    components: { CommissionAutocompleteSearch, OrganisationUnitAutocompleteSearch, ScheduledTasksList, Toast, RelativeDatePreview },
    setup() {
        const currentTab = ref("scheduling");

        const isFormValid = ref(false);
        const i18n = useI18n();

        const snackbar = ref(false);
        const message = ref("");

        const reportTypes = ref(getReportTypesForGivenLocale());
        const selectedReportType = ref<ReportType>(ReportType.TABLE_63);

        const selectedCommissions = ref<{title: string, value: number}[] | {title: string, value: number}>([]);
        const selectedOUs = ref<{title: string, value: number}[] | {title: string, value: number}>([]);

        const selectedYear = ref<number>((new Date()).getFullYear());

        const generatedReports = ref<{name: string, value: number}[]>([]);
        const allGeneratedReports = ref<{name: string, value: number}[]>([]);

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

        const recurrenceTypes = computed(() => getRecurrenceTypesForGivenLocale());
        const selectedRecurrenceType = ref<{title: string, value: RecurrenceType}>(
            {title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string, value: RecurrenceType.ONCE}
        );

        onMounted(() => {
            fetchScheduledTasks();
            fetchAllGeneratedReports();

            const now = new Date();
            const secondsUntilNextMinute = 60 - now.getSeconds();
            const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000;

            document.title = `TeslaRIS - ${i18n.t("routeLabel.reporting")}}`;

            setTimeout(() => {
                fetchScheduledTasks();
                startTasksInterval()
            }, millisecondsUntilNextMinute);

            setTimeout(() => {
                fetchAllGeneratedReports();
                startReportsInterval();
            }, millisecondsUntilNextMinute);
        });

        const fetchScheduledTasks = () => {
            TaskManagerService.listScheduledReportGenerationTasks().then((response) => {
                scheduledTasks.value = response.data;
                scheduledTasks.value.sort((a, b) => {
                    if(!a.executionTime) {
                        return 1;
                    }

                    return a.executionTime.localeCompare(b.executionTime);
                });
            });
        };
        const { startInterval: startTasksInterval } = useInterval(fetchScheduledTasks, 1000 * 60);

        const fetchAllGeneratedReports = () => {
            allGeneratedReports.value.splice(0);
            ReportingService.fetchAllGeneratedReports().then(response => {
                    response.data.forEach(report => {
                        allGeneratedReports.value.push({name: report.reportFileName, value: report.commissionId});
                    });
                });
        };
        const { startInterval: startReportsInterval } = useInterval(fetchAllGeneratedReports, 1000 * 60);

        watch(i18n.locale, () => {
            populateSelectionData();
        });

        watch(selectedCommissions, () => {
            let commissionIds = [];
            if (isSummaryReport()) {
                commissionIds = (selectedCommissions.value as {title: string, value: number}[]).map(commission => commission.value);
            } else {
                commissionIds = [(selectedCommissions.value as {title: string, value: number}).value];
            }

            generatedReports.value.splice(0);
            commissionIds.forEach(commissionId => {
                ReportingService.fetchAllGeneratedReportsForCommission(commissionId).then(response => {
                    response.data.forEach(reportName => {
                        generatedReports.value.push({name: reportName, value: commissionId});
                    });
                });
            });
        });

        const populateSelectionData = () => {
            reportTypes.value = getReportTypesForGivenLocale();
        };

        const {
            requiredSelectionRules,
            requiredNumericFieldRules
        } = useValidationUtils();

        const isTopLevelReport = () => {
            if (
                selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION || 
                selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_COLORED || 
                selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY
            ) {
                return true;
            }

            return false;
        };

        const isSummaryReport = () => {
            if (selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY) {
                return true;
            }

            return false;
        };

        const scheduleReportGeneration = () => {
            const topLevelInstitutionId = (selectedOUs.value as {title: string, value: number}).value;
            const timeToRun = new Date(Date.now() + 60 * 60 * 1000).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 19);
            TaskManagerService.scheduleReportGeneration(
                timeToRun, selectedReportType.value,
                selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY ? (selectedCommissions.value as {title: string, value: number}[]).map(commission => commission.value) : [(selectedCommissions.value as {title: string, value: number}).value],
                selectedYear.value, topLevelInstitutionId, "sr", selectedRecurrenceType.value.value
            )
            .then(() => fetchScheduledTasks())
            .catch((axiosError: AxiosError<ErrorResponse>) => {
                const errorMessage = i18n.t(axiosError.response?.data.message as string);
                if (errorMessage !== axiosError.response?.data.message) {
                    message.value = errorMessage;
                } else {
                    message.value = i18n.t("genericErrorMessage");
                }
                snackbar.value = true;
            });
        };

        const downloadReport = (reportName: string, commissionId: number) => {
            ReportingService.downloadReport(reportName, commissionId);
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
        
        return {
            selectedCommissions, reportTypes,
            selectedReportType, selectedOUs,
            isTopLevelReport, isSummaryReport,
            requiredSelectionRules, RecurrenceType,
            requiredNumericFieldRules,
            selectedYear, scheduleReportGeneration,
            isFormValid, generatedReports,
            downloadReport, scheduledTasks,
            deleteScheduledLoadTask, message, snackbar,
            currentTab, allGeneratedReports,
            recurrenceTypes, selectedRecurrenceType
        };
    }
});
</script>
