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
            </div>
            <h2 v-else class="d-flex flex-row justify-center">
                {{ $t("setupIdentifiersMessage") }}
            </h2>

            <v-container class="d-flex flex-row justify-center">
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
import { ref } from "vue";
import { defineComponent } from "vue";
import DatePicker from "@/components/core/DatePicker.vue";
import ImportService from "@/services/ImportService";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Toast from "@/components/core/Toast.vue";
import { useInterval } from "@/composables/useInterval";
import { useUserRole } from "@/composables/useUserRole";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";


export default defineComponent({
    name: "HarvesterView",
    components: { DatePicker, Toast, OrganisationUnitAutocompleteSearch },
    setup() {
        const isFormValid = ref(false);
        const canPerformHarvest = ref(false);
        
        const snackbar = ref(false);
        const errorMessage = ref("");
        const i18n = useI18n();

        const startDate = ref();
        const endDate = ref();
        const loading = ref(false);
        const harvestComplete = ref(false);
        const numberOfHarvestedDocuments = ref(0);
        const newDocumentsHarvested = ref(0);

        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});
        const { isAdmin } = useUserRole();

        onMounted(() => {
            document.title = i18n.t("harvestDataLabel");

            fetchNumberOfHarvestedDocuments();

            ImportService.canPerformHarvest().then(response => {
                canPerformHarvest.value = response.data;
            });

            // Fetch number of imported documents 10 seconds
            useInterval(fetchNumberOfHarvestedDocuments, 1000 * 10);
        });

        const fetchNumberOfHarvestedDocuments = () => {
            ImportService.getHarvestedDocumentsCount().then(response => {
                numberOfHarvestedDocuments.value = response.data;
            });
        };

        const startHarvest = () => {
            loading.value = true;
            harvestComplete.value = false;
            ImportService.startHarvest(startDate.value, endDate.value, selectedOrganisationUnit.value.value).then(response => {
                loading.value = false;
                harvestComplete.value = true;
                newDocumentsHarvested.value = response.data;
                fetchNumberOfHarvestedDocuments();
            }).catch((error) => {
                if(error.response.status === 500) {
                    errorMessage.value = i18n.t("harvestFailedMessage");
                } else {
                    errorMessage.value = i18n.t("genericErrorMessage");
                }
                snackbar.value = true;
                loading.value = false;
            });
        };

        return {
            startDate, endDate,
            loading, startHarvest,
            numberOfHarvestedDocuments,
            newDocumentsHarvested,
            harvestComplete, isAdmin,
            isFormValid, snackbar,
            errorMessage, canPerformHarvest,
            selectedOrganisationUnit
        };
    },
});
</script>