<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("reportingLabel") }}
    </h1>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center mt-5 bg-grey-lighten-5">
            <v-col cols="2">
                <v-select
                    v-model="selectedReportType"
                    :items="reportTypes"
                    :label="$t('reportTypeLabel') + '*'"
                    :class="isSummaryReport() ? 'comfortable' : ''"
                    :rules="requiredSelectionRules"
                    :readonly="false">
                </v-select>
            </v-col>
            <v-col cols="2">
                <commission-autocomplete-search
                    v-model="selectedCommissions"
                    only-load-commissions
                    required
                    :multiple="isSummaryReport()">
                </commission-autocomplete-search>
            </v-col>
            <v-col v-if="isTopLevelReport()" cols="3">
                <organisation-unit-autocomplete-search
                    v-model="selectedOUs" :multiple="!isTopLevelReport()" disable-submission :required="isTopLevelReport()"
                    :comfortable="isSummaryReport()" :label="isTopLevelReport() ? 'topLevelInstitutionLabel' : ''"></organisation-unit-autocomplete-search>
            </v-col>
            <v-col cols="2">
                <v-select
                    v-model="selectedYear"
                    :items="years"
                    :label="$t('reportYearLabel') + '*'"
                    :rules="requiredSelectionRules"
                    :class="isSummaryReport() ? 'comfortable' : ''">
                </v-select>
            </v-col>
            <v-col cols="1">
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

    <scheduled-tasks-list :scheduled-tasks="scheduledTasks" @delete="deleteScheduledLoadTask"></scheduled-tasks-list>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import CommissionAutocompleteSearch from '../commission/CommissionAutocompleteSearch.vue';
import { getReportTypesForGivenLocale } from '@/i18n/reportType';
import { ReportType, type ScheduledTaskResponse } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { useValidationUtils } from '@/utils/ValidationUtils';
import TaskManagerService from '@/services/TaskManagerService';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import ReportingService from '@/services/assessment/ReportingService';
import ScheduledTasksList from '@/components/core/ScheduledTasksList.vue';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "ViewIndicatorsComponent",
    components: { CommissionAutocompleteSearch, OrganisationUnitAutocompleteSearch, ScheduledTasksList, Toast },
    setup() {
        const isFormValid = ref(false);
        const i18n = useI18n();

        const snackbar = ref(false);
        const message = ref("");

        const reportTypes = ref(getReportTypesForGivenLocale());
        const selectedReportType = ref<ReportType>(ReportType.TABLE_63);

        const selectedCommissions = ref<{title: string, value: number}[] | {title: string, value: number}>([]);
        const selectedOUs = ref<{title: string, value: number}[] | {title: string, value: number}>([]);

        const years = ref<number[]>([]);
        const selectedYear = ref<number>((new Date()).getFullYear());

        const generatedReports = ref<{name: string, value: number}[]>([]);

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

        onMounted(() => {
            fetchScheduledTasks();

            const now = new Date();
            const secondsUntilNextMinute = 60 - now.getSeconds();
            const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000;

            for(let i = 1999; i <= now.getFullYear(); i++) {
                years.value.push(i);
            }

            setTimeout(() => {
                fetchScheduledTasks();
                setInterval(fetchScheduledTasks, 1000 * 60);
            }, millisecondsUntilNextMinute);
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

        const { requiredSelectionRules } = useValidationUtils();

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
            TaskManagerService.scheduleReportGeneration(
                (new Date(((new Date()).getTime() + 61 * 60 * 1000 ))).toISOString().split(".")[0], selectedReportType.value,
                selectedReportType.value === ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY ? (selectedCommissions.value as {title: string, value: number}[]).map(commission => commission.value) : [(selectedCommissions.value as {title: string, value: number}).value],
                selectedYear.value, topLevelInstitutionId, "sr"
            ).then(() => fetchScheduledTasks());
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
            requiredSelectionRules, years,
            selectedYear, scheduleReportGeneration,
            isFormValid, generatedReports,
            downloadReport, scheduledTasks,
            deleteScheduledLoadTask, message, snackbar
        };
    }
});
</script>
