<template>
    <v-container>
        <v-form v-model="isFormValid" @submit.prevent>
            <h1 class="d-flex flex-row justify-center">
                {{ $t("harvestDataLabel") }}
            </h1>
            <br />
            <div>
                <v-section v-if="currentTab === 'externalSources'">
                    <v-row
                        v-if="isAdmin"
                        class="d-flex flex-row justify-center"
                    >
                        <v-col cols="12" md="8">
                            <organisation-unit-autocomplete-search
                                v-model:model-value="selectedOrganisationUnit"
                                required
                                disable-submission
                                :only-harvestable-institutions="searchHarvestableInstitutions"
                            ></organisation-unit-autocomplete-search>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-checkbox
                                v-model="searchHarvestableInstitutions"
                                :label="$t('showOnlyHarvestableLabel')"
                                hide-details
                            />
                        </v-col>
                    </v-row>
                    <loading-configuration-form
                        v-if="isInstitutionalEditor || (isAdmin && selectedOrganisationUnit.value > 0)"
                        :top-level-institution-id="selectedOrganisationUnit.value"
                    />
                    <v-row
                        v-if="canPerformHarvest && ((isAdmin && selectedOrganisationUnit.value > 0) || isInstitutionalEditor) && researcherSelection"
                        class="d-flex flex-row justify-center"
                    >
                        <v-col cols="8">
                            <person-autocomplete-search
                                v-model="selectedPersons"
                                required multiple
                                disable-submission
                                only-harvestable
                                :institution-id="selectedOrganisationUnit.value"
                            />
                        </v-col>
                        <v-col cols="2">
                            <v-btn
                                density="compact"
                                class="mt-5"
                                @click="researcherSelection = false">
                                {{ $t("importForAllAuthors") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row
                        v-if="canPerformHarvest && ((isAdmin && selectedOrganisationUnit.value > 0) || isInstitutionalEditor) && !researcherSelection"
                        class="d-flex flex-row justify-center">
                        <v-col cols="2">
                            <v-btn
                                density="compact"
                                class="bottom-spacer"
                                @click="researcherSelection = true">
                                {{ $t("selectAuthorsForImport") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-section>

                <v-tabs
                    v-model="currentTab"
                    class="mt-15"
                    color="deep-purple-accent-4"
                    bg-color="blue-grey-lighten-5"
                    align-tabs="center">
                    <v-tab value="externalSources">
                        {{ $t("externalSourcesLabel") }}
                    </v-tab>
                    <v-tab v-if="isAdmin" value="oaiSources">
                        {{ $t("oaiSourcesLabel") }}
                    </v-tab>
                    <v-tab v-if="isResearcher" value="files">
                        {{ $t("blibliographisFormatFilesLabel") }}
                    </v-tab>
                    <v-tab v-if="isAdmin || isInstitutionalEditor" value="scheduledHarvests">
                        {{ $t("scheduledHarvestsLabel") }}
                    </v-tab>
                </v-tabs>

                <v-window
                    v-model="currentTab"
                    class="mt-10">
                    <v-window-item v-if="currentTab === 'externalSources'" value="externalSources">
                        <v-row v-if="canPerformHarvest" class="d-flex flex-row justify-center">
                            <v-col cols="12" sm="4">
                                <date-picker-split
                                    v-if="isAdmin || isInstitutionalEditor"
                                    v-model="startDate"
                                    :label="$t('startDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker-split>
                                <date-picker
                                    v-else
                                    v-model="startDate"
                                    :label="$t('startDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <date-picker-split
                                    v-if="isAdmin || isInstitutionalEditor"
                                    v-model="endDate"
                                    :label="$t('endDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker-split>
                                <date-picker
                                    v-else
                                    v-model="endDate"
                                    :label="$t('endDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker>
                            </v-col>
                        </v-row>
                        <v-row v-if="canPerformHarvest" class="d-flex flex-row justify-center">
                            <v-col cols="auto">
                                <v-btn color="primary" :disabled="!isFormValid" @click="startHarvest">
                                    {{ $t("scanSourcesLabel") }}
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row v-if="canPerformHarvest && !isResearcher" class="d-flex flex-row justify-center">
                            <v-col cols="auto">
                                <generic-crud-modal
                                    :form-component="ScheduleHarvestForm"
                                    :form-props="{startDate: startDate, endDate: endDate}"
                                    entity-name="ScheduleHarvest"
                                    primary-color
                                    :disabled="!isFormValid"
                                    @create="scheduleHarvest"
                                />
                            </v-col>
                        </v-row>
                        <h2 v-if="!canPerformHarvest" class="d-flex flex-row justify-center text-center">
                            {{ isInstitutionalEditor ? $t("harvestDisabledMessage") : $t("setupIdentifiersMessage") }}
                        </h2>
                    </v-window-item>
                    <v-window-item value="oaiSources">
                        <v-row class="d-flex flex-row justify-center">
                            <v-col cols="12" sm="8">
                                <v-select
                                    v-model="selectedOaiSource"
                                    :items="oaiSources"
                                    :label="$t('oaiSourceLabel') + '*'"
                                    :rules="requiredSelectionRules">
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-row class="d-flex flex-row justify-center">
                            <v-col cols="12" sm="4">
                                <date-picker-split
                                    v-model="startDateOai"
                                    :label="$t('startDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker-split>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <date-picker-split
                                    v-model="endDateOai"
                                    :label="$t('endDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker-split>
                            </v-col>
                        </v-row>
                        <v-row class="d-flex flex-row justify-center">
                            <v-col cols="auto">
                                <generic-crud-modal
                                    :form-component="ScheduleHarvestForm"
                                    :form-props="{startDate: startDateOai, endDate: endDateOai}"
                                    entity-name="ScheduleHarvest"
                                    primary-color
                                    :disabled="!isFormValid"
                                    @create="scheduleOaiHarvest"
                                />
                            </v-col>
                        </v-row>
                    </v-window-item>
                    <v-window-item value="files">
                        <v-row class="d-flex flex-row justify-center">
                            <v-col cols="auto">
                                <v-file-upload
                                    v-model="files"
                                    clearable
                                    density="default"
                                    :title="$t('dragDropFilesLabel')"
                                    :browse-text="$t('browseFilesLabel')"
                                    :divider-text="$t('orChooseLocalLabel')"
                                    accept=".ris, .csv, .bib, .enw"
                                    multiple
                                >
                                    <template #append>
                                        <v-tooltip location="top">
                                            <template #activator="{ props }">
                                                <v-icon
                                                    v-show="isCSVFileSelected()"
                                                    v-bind="props"
                                                    icon="mdi-help-circle-outline"
                                                    class="ml-2"
                                                    color="primary"
                                                    style="cursor: pointer"
                                                />
                                            </template>
                                            <span>
                                                <pre>{{ requiredFieldsDescription }}</pre>
                                                <pre>{{ supportedFieldsDescription }}</pre>
                                            </span>
                                        </v-tooltip>
                                    </template>
                                </v-file-upload>
                            </v-col>
                        </v-row>

                        <v-row class="d-flex flex-row justify-center">
                            <v-col cols="auto">
                                <v-btn color="primary" :disabled="files.length === 0" @click="uploadBibliographicFiles">
                                    {{ $t("uploadLabel") }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-window-item>
                    <v-window-item value="scheduledHarvests">
                        <scheduled-tasks-list
                            :scheduled-tasks="scheduledTasks"
                            @delete="deleteScheduledHarvestTask">
                        </scheduled-tasks-list>
                    </v-window-item>
                </v-window>
            </div>

            <v-container class="d-flex flex-row justify-center mt-10">
                <h2>{{ $t("documentsReadyForImportLabel") }}: {{ numberOfHarvestedDocuments }}</h2>
            </v-container>
            <v-row v-if="loading" class="d-flex flex-row justify-center submission-action">
                <v-progress-circular
                    :size="70"
                    :width="7"
                    color="blue"
                    indeterminate
                ></v-progress-circular>
            </v-row>
            <v-container v-if="harvestComplete" class="d-flex flex-row justify-center">
                <h2 v-if="newDocumentsHarvested > 0">
                    {{ $t("newlyImportedDocumentsCountLabel") }}: {{ newDocumentsHarvested }}
                </h2>
                <h2 v-else>
                    {{ $t("noNewDocumentsMessage") }}
                </h2>
            </v-container>
            <v-row v-if="numberOfHarvestedDocuments > 0" class="d-flex flex-row justify-center">
                <v-col cols="auto">
                    <v-btn
                        color="primary" 
                        :disabled="loading"
                        :to="'/' + $i18n.locale + '/loader'">
                        {{ $t("loadNewDocumentsLabel") }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>

        <toast v-model="snackbar" :message="errorMessage" />
    </v-container>
</template>

<script lang="ts">
import { ref, watch } from "vue";
import { defineComponent } from "vue";
import DatePicker from "@/components/core/DatePicker.vue";
import ImportService from "@/services/importer/ImportService";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Toast from "@/components/core/Toast.vue";
import { useInterval } from "@/composables/useInterval";
import { useUserRole } from "@/composables/useUserRole";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import LoadingConfigurationForm from "@/components/import/LoadingConfigurationForm.vue";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import PersonAutocompleteSearch from "@/components/person/PersonAutocompleteSearch.vue";
import LoadingConfigurationService from "@/services/importer/LoadingConfigurationService";
import { useRouter } from "vue-router";
import { type AuthorCentricInstitutionHarvestRequest } from "@/models/LoadModel";
import ScheduleHarvestForm from "@/components/import/ScheduleHarvestForm.vue";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import { type ScheduledTaskResponse } from "@/models/Common";
import TaskManagerService from "@/services/TaskManagerService";
import ScheduledTasksList from "@/components/core/ScheduledTasksList.vue";
import { useLoginStore } from "@/stores/loginStore";
import OrganisationUnitImportSourceService from "@/services/importer/OrganisationUnitImportSourceService";
import { useValidationUtils } from "@/utils/ValidationUtils";
import DatePickerSplit from "@/components/core/DatePickerSplit.vue";


export default defineComponent({
    name: "HarvesterView",
    components: { DatePicker, DatePickerSplit, Toast, OrganisationUnitAutocompleteSearch, LoadingConfigurationForm, PersonAutocompleteSearch, GenericCrudModal, ScheduledTasksList },
    setup() {
        const isFormValid = ref(false);
        const canPerformHarvest = ref(false);
        const currentTab = ref("externalSources");

        const snackbar = ref(false);
        const errorMessage = ref("");
        const i18n = useI18n();

        const files = ref<File[]>([]);
        const searchHarvestableInstitutions = ref(true);
        const researcherSelection = ref(false);
        const mustHarvestUsingResearcherIds = ref(false);
        const router = useRouter();

        const startDate = ref();
        const endDate = ref();

        const startDateOai = ref();
        const endDateOai = ref();

        const loading = ref(false);
        const harvestComplete = ref(false);
        const numberOfHarvestedDocuments = ref(0);
        const newDocumentsHarvested = ref(0);

        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});
        const selectedPersons = ref<{title: string, value: number}[]>([]);
        const { isAdmin, isInstitutionalEditor, isResearcher, loggedInUser } = useUserRole();

        const { requiredSelectionRules } = useValidationUtils();

        const requiredFieldsDescription = ref("");
        const supportedFieldsDescription = ref("");

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

        onMounted(() => {
            document.title = i18n.t("harvestDataLabel");

            fetchNumberOfHarvestedDocuments(true);

            ImportService.canPerformHarvest().then(response => {
                canPerformHarvest.value = response.data;
                if (isInstitutionalEditor.value && !response.data) {
                    OrganisationUnitImportSourceService.fetchConfigurationForOrganisationUnit(loggedInUser.value?.organisationUnitId as number)
                    .then(response => {
                        if (response.data.importScopus || response.data.importOpenAlex || response.data.importWebOfScience) {
                            mustHarvestUsingResearcherIds.value = true;
                            canPerformHarvest.value = true;
                        }
                    });
                }
            });

            startInterval();
            fetchScheduledTasks();

            if (isAdmin.value) {
                fetchOaiSources();
            }
        });

        watch(selectedOrganisationUnit, () => {
            selectedPersons.value.splice(0);
            fetchNumberOfHarvestedDocuments();
            fetchOU();
        });

        const loginStore = useLoginStore();
        watch(() => loginStore.userLoggedIn, () => {
            currentTab.value = "externalSources";
        });

        watch(files, () => {
            if (isCSVFileSelected()) {
                ImportService.getCSVFileFormatDescription().then(response => {
                    requiredFieldsDescription.value = response.data.a;
                    supportedFieldsDescription.value = "\n" + response.data.b;
                });
            }
        });

        const isCSVFileSelected = (): boolean => {
            return files.value.some(file => file.name.endsWith(".csv"));
        };

        const fetchNumberOfHarvestedDocuments = (checkPriorityLoad: boolean = false) => {
            ImportService.getHarvestedDocumentsCount(
                selectedOrganisationUnit.value.value > 0 ? selectedOrganisationUnit.value.value : null
            ).then(response => {
                numberOfHarvestedDocuments.value = response.data;
                
                if (checkPriorityLoad) {
                    checkForPriorityLoading();
                }
            });
        };

        const fetchOU = () => {
            if (selectedOrganisationUnit.value.value > 0) {
                OrganisationUnitService.readOU(selectedOrganisationUnit.value.value)
                .then(response => {
                    mustHarvestUsingResearcherIds.value = (!response.data.scopusAfid && !response.data.openAlexId);
                });
            }
        };

        const checkForPriorityLoading = () => {
            if (isResearcher.value) {
                LoadingConfigurationService.fetchLoadingConfiguration().then(response => {
                    if (response.data.priorityLoading && numberOfHarvestedDocuments.value > 0) {
                        router.push({ name: "loader" });
                    }
                })
            }
        };

        // Fetch number of imported documents 10 seconds
        const { startInterval } = useInterval(fetchNumberOfHarvestedDocuments, 1000 * 10);

        const startHarvest = () => {
            startLoading();

            if (!mustHarvestUsingResearcherIds.value && !researcherSelection.value) {
                regularIdentifierHarvest();
            } else {
                authorCentricInstitutionHarvest();
            }
        };

        const regularIdentifierHarvest = () => {
            ImportService.startHarvest(
                startDate.value, endDate.value,
                selectedOrganisationUnit.value.value
            ).then(response => {
                finishLoading(response.data);
            }).catch((error) => {
                handleError(error.response.status);
            });
        };

        const authorCentricInstitutionHarvest = () => {
            const request: AuthorCentricInstitutionHarvestRequest = {
                authorIds: selectedPersons.value.map(person => person.value),
                allAuthors: mustHarvestUsingResearcherIds.value && !researcherSelection.value,
                institutionId: selectedOrganisationUnit.value.value
            };

            ImportService.startAuthorCentricInstitutionHarvest(
                startDate.value, endDate.value, request
            ).then(response => {
                finishLoading(response.data);
            }).catch((error) => {
                handleError(error.response.status);
            });
        };

        const uploadBibliographicFiles = () => {
            startLoading();

            ImportService.uploadBibiographicFiles(files.value).then(response => {
                files.value.splice(0);
                finishLoading(response.data);
            }).catch((error) => {
                handleError(error.response.status);
            });
        };

        const startLoading = () => {
            loading.value = true;
            harvestComplete.value = false;
        };

        const finishLoading = (numberOfNewlyHarvestedDocuments: number) => {
            loading.value = false;
            harvestComplete.value = true;
            newDocumentsHarvested.value = numberOfNewlyHarvestedDocuments;
            fetchNumberOfHarvestedDocuments();
        };

        const handleError = (errorStatus: number) => {
            if(errorStatus === 500) {
                errorMessage.value = i18n.t("harvestFailedMessage");
            } else if(errorStatus === 400) {
                errorMessage.value = i18n.t("cantScheduleInPastMessage");
            } else {
                errorMessage.value = i18n.t("genericErrorMessage");
            }
            snackbar.value = true;
            loading.value = false;
        };

        const fetchScheduledTasks = () => {
            TaskManagerService.listScheduledHarvestTasks().then((response) => {
                scheduledTasks.value = response.data;
                scheduledTasks.value.sort((a, b) => {
                    if(!a.executionTime) {
                        return 1;
                    }

                    return a.executionTime.localeCompare(b.executionTime);
                });
            });
        };

        const scheduleHarvest = (scheduleParams: any) => {
            if (!mustHarvestUsingResearcherIds.value && !researcherSelection.value) {
                ImportService.scheduleHarvest(
                    scheduleParams[0], scheduleParams[1],
                    startDate.value, endDate.value,
                    selectedOrganisationUnit.value.value
                ).then(() => {
                    fetchScheduledTasks();
                    currentTab.value = "scheduledHarvests";
                }).catch((error) => {
                    handleError(error.response.status);
                });
            } else {
                const request: AuthorCentricInstitutionHarvestRequest = {
                    authorIds: selectedPersons.value.map(person => person.value),
                    allAuthors: mustHarvestUsingResearcherIds.value && !researcherSelection.value,
                    institutionId: selectedOrganisationUnit.value.value
                };

                ImportService.scheduleAuthorCentricInstitutionHarvest(
                    scheduleParams[0], scheduleParams[1],
                    startDate.value, endDate.value, request
                ).then(() => {
                    fetchScheduledTasks();
                    currentTab.value = "scheduledHarvests";
                }).catch((error) => {
                    handleError(error.response.status);
                });
            }
        };

        const deleteScheduledHarvestTask = (taskId: string) => {
            TaskManagerService.canceltask(taskId).then(() => {
                errorMessage.value = i18n.t("cancelSuccessMessage");
                snackbar.value = true;
                fetchScheduledTasks();
            }).catch(() => {
                errorMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const oaiSources = ref<string[]>([]);
        const selectedOaiSource = ref<string>("");
        const fetchOaiSources = () => {
            ImportService.fetchOAIPMHSources().then(response => {
                oaiSources.value = response.data;
                if (oaiSources.value.length > 0) {
                    selectedOaiSource.value = oaiSources.value[0];
                }
            })
        };

        const scheduleOaiHarvest = (scheduleParams: any) => {
            ImportService.scheduleOAIPMHHarvest(
                selectedOaiSource.value,
                scheduleParams[0],
                scheduleParams[1],
                startDateOai.value.split("T")[0],
                endDateOai.value.split("T")[0]
            ).then(() => {
                fetchScheduledTasks();
                currentTab.value = "scheduledHarvests";
            }).catch((error) => {
                handleError(error.response.status);
            });
        };

        return {
            startDate, endDate,
            loading, startHarvest,
            numberOfHarvestedDocuments,
            newDocumentsHarvested,
            harvestComplete, isAdmin,
            isFormValid, snackbar, files,
            errorMessage, canPerformHarvest,
            selectedOrganisationUnit,
            isInstitutionalEditor,
            isResearcher, currentTab,
            uploadBibliographicFiles,
            isCSVFileSelected,
            requiredSelectionRules,
            requiredFieldsDescription,
            supportedFieldsDescription,
            searchHarvestableInstitutions,
            selectedPersons, researcherSelection,
            ScheduleHarvestForm, scheduleHarvest,
            scheduledTasks, deleteScheduledHarvestTask,
            oaiSources, selectedOaiSource,
            scheduleOaiHarvest, startDateOai, endDateOai
        };
    },
});
</script>