<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("routeLabel.thesisLibraryBackup") }}
    </h1>
    <v-tabs
        v-model="currentTab"
        color="deep-purple-accent-4"
        class="mt-5"
        align-tabs="center">
        <v-tab value="backupGeneration">
            {{ $t("backupGenerationLabel") }}
        </v-tab>
        <v-tab value="scheduledBackups">
            {{ $t("scheduledBackupsLabel") }}
        </v-tab>
        <v-tab value="generatedBackupList">
            {{ $t("backupListLabel") }}
        </v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
        <v-window-item value="backupGeneration">
            <v-form ref="formRef" v-model="isFormValid" class="mb-5" @submit.prevent>
                <v-row class="d-flex flex-row justify-center mt-5">
                    <v-col cols="12" md="4" lg="4">
                        <v-select
                            v-model="selectedThesisTypes"
                            :items="thesisTypes"
                            multiple
                            :label="$t('thesisTypeLabel') + '*'"
                            :rules="requiredSelectionRules">
                        </v-select>
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="12" md="4" lg="4">
                        <v-select
                            v-model="selectedFileSections"
                            :items="fileSections"
                            multiple
                            :label="$t('fileSectionsLabel') + '*'"
                            :rules="requiredSelectionRules">
                        </v-select>
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="12" md="4">
                        <organisation-unit-autocomplete-search
                            v-model="selectedOU"
                            disable-submission
                            required
                            :top-level-institution-id="isAdmin ? undefined : loggedInUser?.organisationUnitId"
                            label="topLevelInstitutionLabel">
                        </organisation-unit-autocomplete-search>
                    </v-col>    
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="12" sm="4" md="2">
                        <v-checkbox
                            v-model="thesesGroups.defended"
                            :label="$t('defendedLabel')"
                            :rules="conditionalRule"
                        ></v-checkbox>
                    </v-col>
                    <v-col cols="12" sm="4" md="2">
                        <v-checkbox
                            v-model="thesesGroups.putOnReview"
                            :label="$t('publicReviewThesesLabel')"
                            :rules="conditionalRule"
                        ></v-checkbox>
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="12" sm="6" md="2">
                        <v-select
                            v-model="selectedLang"
                            :items="langItems"
                            :label="$t('languageLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="2">
                        <v-select
                            v-model="selectedExportFileFormat"
                            :items="exportFileFormats"
                            :label="$t('metadataFormatLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="12" sm="6" md="2">
                        <date-picker
                            v-model="dateFrom"
                            :label="$t('fromLabel') + '*'"
                            color="primary"
                            required
                        ></date-picker>
                    </v-col>
                    <v-col cols="12" sm="6" md="2">
                        <date-picker
                            v-model="dateTo"
                            :label="$t('toLabel') + '*'"
                            color="primary"
                            required
                        ></date-picker>
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="selectedRecurrenceType"
                            :items="recurrenceTypes"
                            :label="$t('recurrenceTypeLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="3" md="1">
                        <v-btn class="mt-3" :disabled="!isFormValid" @click="generateBackupRequest">
                            {{ $t("generateLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-window-item>
        <v-window-item value="scheduledBackups">
            <scheduled-tasks-list
                :scheduled-tasks="scheduledTasks"
                @delete="deleteScheduledBackupTask">
            </scheduled-tasks-list>
        </v-window-item>
        <v-window-item value="generatedBackupList">
            <backup-list backup-type="thesis"></backup-list>
        </v-window-item>
    </v-window>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { getThesisTitleFromValueAutoLocale, getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { ThesisFileSection } from '@/models/ThesisLibraryModel';
import DatePicker from '@/components/core/DatePicker.vue';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getThesisFileSectionsForGivenLocale } from '@/i18n/thesisFileSection';
import { getLangItems } from '@/i18n/languages';
import ThesisLibraryBackupService from '@/services/thesisLibrary/ThesisLibraryBackup';
import Toast from '@/components/core/Toast.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { VForm } from 'vuetify/lib/components/index.mjs';
import { useUserRole } from '@/composables/useUserRole';
import BackupList from '../../components/core/BackupList.vue';
import { ExportFileFormat, type ScheduledTaskResponse } from '@/models/Common';
import { getRecurrenceTypesForGivenLocale, getRecurrenceTypeTitleFromValueAutoLocale } from '@/i18n/recurrenceType';
import { RecurrenceType } from '@/models/LoadModel';
import ScheduledTasksList from '@/components/core/ScheduledTasksList.vue';
import TaskManagerService from '@/services/TaskManagerService';


export default defineComponent({
    name: "ThesisLibraryBackupView",
    components: { Toast, DatePicker, OrganisationUnitAutocompleteSearch, BackupList, ScheduledTasksList },
    setup() {
        const currentTab = ref("backupGeneration");
        const isFormValid = ref(false);
        const i18n = useI18n();
        const snackbar = ref(false);
        const message = ref("");
        const { loggedInUser, isAdmin } = useUserRole();

        const thesisTypes = computed(() => getThesisTypesForGivenLocale());
        const fileSections = computed(() => getThesisFileSectionsForGivenLocale());
        const selectedThesisTypes = ref<{title: string, value: ThesisType}[]>([{title: getThesisTitleFromValueAutoLocale(ThesisType.PHD) as string, value: ThesisType.PHD}]);
        const selectedFileSections = ref<{title: string, value: ThesisFileSection}[]>([]);
        const selectedOU = ref<{title: string, value: number}>();
        const dateFrom = ref("");
        const dateTo = ref("");
        
        const formRef = ref<typeof VForm>();
        const thesesGroups = ref<{defended: boolean, putOnReview: boolean}>({defended: true, putOnReview: true});
        
        const langItems = getLangItems();
        const selectedLang = ref<{title: string, value: string}>({title: "Srpski", value: "sr"});
        const exportFileFormats = ref<ExportFileFormat[]>([ExportFileFormat.CSV, ExportFileFormat.XLS]);
        const selectedExportFileFormat = ref<ExportFileFormat>(ExportFileFormat.CSV);

        const { requiredSelectionRules, atLeastOneTrueRule } = useValidationUtils();
        const conditionalRule = atLeastOneTrueRule(thesesGroups, [
            "defended",
            "putOnReview"
        ]);

        const recurrenceTypes = computed(() => getRecurrenceTypesForGivenLocale());
        const selectedRecurrenceType = ref<{title: string, value: RecurrenceType}>(
            {title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string, value: RecurrenceType.ONCE}
        );

        watch(
        () => [
            thesesGroups.value.defended,
            thesesGroups.value.putOnReview
        ], () => {
            formRef.value?.validate?.();
        });

        onMounted(() => {
            selectedFileSections.value.splice(0);
            fileSections.value?.forEach(fileSection => {
                selectedFileSections.value.push(fileSection);
            });

            document.title = i18n.t("routeLabel.thesisLibraryBackup");
            fetchScheduledTasks();
        });

        const generateBackupRequest = () => {
            let params = `from=${dateFrom.value.split("T")[0]}&to=${dateTo.value.split("T")[0]}&institutionId=${selectedOU.value?.value}&defended=${thesesGroups.value.defended}&putOnReview=${thesesGroups.value.putOnReview}&lang=${selectedLang.value.value}`;
            
            selectedThesisTypes.value.forEach(type => {
                params += `&types=${type.value}`
            });

            selectedFileSections.value.forEach(section => {
                params += `&sections=${section.value}`
            });

            params += `&metadataFormat=${selectedExportFileFormat.value}`;
            
            ThesisLibraryBackupService.scheduleGeneration(
                params, selectedRecurrenceType.value.value
            ).then(response => {
                snackbar.value = true;
                message.value = i18n.t("backupGenerationScheduledMessage", [response.data]);
                fetchScheduledTasks();
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);
        const fetchScheduledTasks = () => {
            TaskManagerService.listScheduledThesisLibraryBackupTasks().then((response) => {
                scheduledTasks.value = response.data;
                scheduledTasks.value.sort((a, b) => {
                    if(!a.executionTime) {
                        return 1;
                    }

                    return a.executionTime.localeCompare(b.executionTime);
                });
            });
        };

        const deleteScheduledBackupTask = (taskId: string) => {
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
            isFormValid, thesisTypes,
            selectedThesisTypes,
            requiredSelectionRules,
            selectedOU, dateFrom,
            dateTo, generateBackupRequest,
            fileSections, formRef,
            thesesGroups, conditionalRule,
            langItems, selectedLang,
            snackbar, message, loggedInUser,
            selectedFileSections,
            isAdmin, currentTab,
            exportFileFormats,
            selectedExportFileFormat,
            recurrenceTypes,
            selectedRecurrenceType,
            scheduledTasks, deleteScheduledBackupTask
        };
    }
});
</script>
