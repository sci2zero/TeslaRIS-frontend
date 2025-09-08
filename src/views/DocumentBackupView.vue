<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("routeLabel.documentBackup") }}
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
            <v-form v-model="isFormValid" class="mb-5" @submit.prevent>
                <v-row class="d-flex flex-row justify-center mt-5">
                    <v-col cols="12" md="4" lg="4">
                        <v-select
                            v-model="selectedDocumentTypes"
                            :items="documentTypes"
                            multiple
                            :label="$t('typeOfPublicationLabel') + '*'"
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
                        <v-text-field
                            v-model="startYear"
                            type="number"
                            :label="$t('fromLabel') + '*'"
                            :placeholder="$t('fromLabel') + '*'"
                            :rules="requiredNumericFieldRules"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="2">
                        <v-text-field
                            v-model="endYear"
                            type="number"
                            :label="$t('toLabel') + '*'"
                            :placeholder="$t('toLabel') + '*'"
                            :rules="requiredNumericFieldRules"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row class="d-flex flex-row justify-center">
                    <v-col cols="12" md="4">
                        <relative-date-preview
                            :start-year="startYear"
                            :end-year="endYear"
                            :recurrence-period="selectedRecurrenceType.value"
                        />
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
            <backup-list backup-type="document"></backup-list>
        </v-window-item>
    </v-window>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { PublicationType } from '@/models/PublicationModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLangItems } from '@/i18n/languages';
import DocumentBackupService from '@/services/DocumentBackupService';
import Toast from '@/components/core/Toast.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { useUserRole } from '@/composables/useUserRole';
import BackupList from '@/components/core/BackupList.vue';
import { getPublicationTypesForGivenLocale } from '@/i18n/publicationType';
import { DocumentFileSection } from '@/models/DocumentFileModel';
import { getDocumentFileSectionsForGivenLocale } from '@/i18n/documentFileSection';
import { ExportFileFormat, type ScheduledTaskResponse } from '@/models/Common';
import { getRecurrenceTypesForGivenLocale, getRecurrenceTypeTitleFromValueAutoLocale } from '@/i18n/recurrenceType';
import { RecurrenceType } from '@/models/LoadModel';
import TaskManagerService from '@/services/TaskManagerService';
import ScheduledTasksList from '@/components/core/ScheduledTasksList.vue';
import RelativeDatePreview from '@/components/core/RelativeDatePreview.vue';
import { useRoute } from 'vue-router';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "DocumentBackupView",
    components: { Toast, OrganisationUnitAutocompleteSearch, BackupList, ScheduledTasksList, RelativeDatePreview },
    setup() {
        const currentTab = ref("backupGeneration");
        const isFormValid = ref(false);
        const i18n = useI18n();
        const snackbar = ref(false);
        const message = ref("");
        const { loggedInUser, isAdmin } = useUserRole();

        const route = useRoute();

        const documentTypes = computed(() => getPublicationTypesForGivenLocale());
        const fileSections = computed(() => getDocumentFileSectionsForGivenLocale());
        const selectedDocumentTypes = ref<{title: string, value: PublicationType}[]>([]);
        const selectedFileSections = ref<{title: string, value: DocumentFileSection}[]>([]);
        const selectedOU = ref<{title: string, value: number}>();
        const startYear = ref<number>((new Date()).getFullYear() - 1);
        const endYear = ref<number>((new Date()).getFullYear());
                
        const langItems = getLangItems();
        const selectedLang = ref<{title: string, value: string}>({title: "Srpski", value: "sr"});
        const exportFileFormats = ref<ExportFileFormat[]>([ExportFileFormat.CSV, ExportFileFormat.XLSX]);
        const selectedExportFileFormat = ref<ExportFileFormat>(ExportFileFormat.CSV);

        const { requiredSelectionRules, requiredNumericFieldRules } = useValidationUtils();

        const recurrenceTypes = computed(() => getRecurrenceTypesForGivenLocale());
        const selectedRecurrenceType = ref<{title: string, value: RecurrenceType}>(
            {title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string, value: RecurrenceType.ONCE}
        );

        onMounted(() => {
            selectedDocumentTypes.value.splice(0);
            documentTypes.value?.forEach(documentType => {
                selectedDocumentTypes.value.push(documentType);
            });

            selectedFileSections.value.splice(0);
            fileSections.value?.forEach(fileSection => {
                selectedFileSections.value.push(fileSection);
            });

            document.title = i18n.t("routeLabel.documentBackup");
            fetchScheduledTasks();

            if (route.query.institutionId) {
                OrganisationUnitService.readOU(
                    parseInt(route.query.institutionId as string)
                ).then(response => {
                    selectedOU.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id};
                });
            }
        });

        const generateBackupRequest = () => {
            let params = `from=${startYear.value}&to=${endYear.value}&institutionId=${selectedOU.value?.value}&lang=${selectedLang.value.value}`;
            
            selectedDocumentTypes.value.forEach(type => {
                params += `&types=${type.value}`
            });

            selectedFileSections.value.forEach(section => {
                params += `&sections=${section.value}`
            });

            params += `&metadataFormat=${selectedExportFileFormat.value}`;
            
            DocumentBackupService.scheduleGeneration(
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
            TaskManagerService.listScheduledDocumentBackupTasks().then((response) => {
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
            isFormValid, documentTypes,
            requiredSelectionRules,
            selectedOU, startYear,
            selectedDocumentTypes,
            requiredNumericFieldRules,
            endYear, generateBackupRequest,
            fileSections, langItems, selectedLang,
            snackbar, message, loggedInUser,
            selectedFileSections, isAdmin, currentTab,
            exportFileFormats, selectedExportFileFormat,
            recurrenceTypes, selectedRecurrenceType,
            scheduledTasks, deleteScheduledBackupTask
        };
    }
});
</script>
