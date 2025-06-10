<template>
    <v-container>
        <v-form v-model="isFormValid" @submit.prevent>
            <h1 class="d-flex flex-row justify-center">
                {{ $t("harvestDataLabel") }}
            </h1>
            <br />
            <div v-if="canPerformHarvest">
                <v-row
                    v-if="isAdmin"
                    class="d-flex flex-row justify-center"
                >
                    <v-col cols="8">
                        <organisation-unit-autocomplete-search
                            v-model:model-value="selectedOrganisationUnit"
                            required
                            disable-submission
                            only-harvestable-institutions
                        ></organisation-unit-autocomplete-search>
                    </v-col>
                </v-row>
                <loading-configuration-form
                    v-if="isInstitutionalEditor || (isAdmin && selectedOrganisationUnit.value > 0)"
                    :top-level-institution-id="selectedOrganisationUnit.value"
                />

                <v-tabs
                    v-model="currentTab"
                    color="deep-purple-accent-4"
                    align-tabs="center">
                    <v-tab value="externalSources">
                        {{ $t("externalSourcesLabel") }}
                    </v-tab>
                    <v-tab v-if="isResearcher" value="files">
                        {{ $t("blibliographisFormatFilesLabel") }}
                    </v-tab>
                </v-tabs>

                <v-window
                    v-model="currentTab"
                    class="mt-10">
                    <v-window-item value="externalSources">
                        <v-row class="d-flex flex-row justify-center">
                            <v-col cols="4">
                                <date-picker
                                    v-model="startDate"
                                    :label="$t('startDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker>
                            </v-col>
                            <v-col cols="4">
                                <date-picker
                                    v-model="endDate"
                                    :label="$t('endDateLabel')"
                                    color="primary"
                                    required
                                ></date-picker>
                            </v-col>
                        </v-row>
                        <v-row class="d-flex flex-row justify-center">
                            <v-col cols="auto">
                                <v-btn color="primary" :disabled="!isFormValid" @click="startHarvest">
                                    {{ $t("scanSourcesLabel") }}
                                </v-btn>
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
                                    multiple>
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
                </v-window>
            </div>
            <h2 v-else class="d-flex flex-row justify-center">
                {{ $t("setupIdentifiersMessage") }}
            </h2>

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


export default defineComponent({
    name: "HarvesterView",
    components: { DatePicker, Toast, OrganisationUnitAutocompleteSearch, LoadingConfigurationForm },
    setup() {
        const isFormValid = ref(false);
        const canPerformHarvest = ref(false);
        const currentTab = ref("externalSources");

        const snackbar = ref(false);
        const errorMessage = ref("");
        const i18n = useI18n();

        const files = ref<File[]>([]);

        const startDate = ref();
        const endDate = ref();
        const loading = ref(false);
        const harvestComplete = ref(false);
        const numberOfHarvestedDocuments = ref(0);
        const newDocumentsHarvested = ref(0);

        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});
        const { isAdmin, isInstitutionalEditor, isResearcher } = useUserRole();

        onMounted(() => {
            document.title = i18n.t("harvestDataLabel");

            fetchNumberOfHarvestedDocuments();

            ImportService.canPerformHarvest().then(response => {
                canPerformHarvest.value = response.data;
            });

            startInterval();
        });

        watch(selectedOrganisationUnit, () => {
            fetchNumberOfHarvestedDocuments();
        })

        const fetchNumberOfHarvestedDocuments = () => {
            ImportService.getHarvestedDocumentsCount(
                selectedOrganisationUnit.value.value > 0 ? selectedOrganisationUnit.value.value : null
            ).then(response => {
                numberOfHarvestedDocuments.value = response.data;
            });
        };

        // Fetch number of imported documents 10 seconds
        const { startInterval } = useInterval(fetchNumberOfHarvestedDocuments, 1000 * 10);

        const startHarvest = () => {
            startLoading();

            ImportService.startHarvest(startDate.value, endDate.value, selectedOrganisationUnit.value.value).then(response => {
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
            } else {
                errorMessage.value = i18n.t("genericErrorMessage");
            }
            snackbar.value = true;
            loading.value = false;
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
            uploadBibliographicFiles
        };
    },
});
</script>