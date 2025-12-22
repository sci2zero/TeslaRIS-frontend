<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("routeLabel.thesisLibraryReporting") }}
    </h1>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center mt-5">
            <v-col cols="12" md="4">
                <v-select
                    v-model="selectedThesisTypes"
                    :items="thesisTypes"
                    :label="$t('thesisTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    multiple
                />
            </v-col>
        </v-row>
        <v-row class="d-flex flex-row justify-center">
            <v-col cols="12" md="4">
                <organisation-unit-autocomplete-search
                    v-model="selectedOUs"
                    multiple
                    disable-submission
                    required
                    comfortable
                    only-client-institutions-dl
                    label="institutionsLabel">
                </organisation-unit-autocomplete-search>
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
            <v-col cols="3" md="1">
                <v-btn
                    class="mt-3 mb-5"
                    :disabled="!isFormValid"
                    @click="generateReportRequest">
                    {{ $t("generateLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-form>

    <v-row class="d-flex flex-row justify-center mt-15!">
        <v-col cols="12" sm="10" md="8">
            <thesis-library-report-table-component
                :report-request="reportRequest">
            </thesis-library-report-table-component>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import ThesisLibraryReportTableComponent from '@/components/thesisLibrary/ThesisLibraryReportTableComponent.vue';
import { getThesisTitleFromValueAutoLocale, getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { type ThesisReportRequest } from '@/models/ThesisLibraryModel';
import DatePicker from '@/components/core/DatePicker.vue';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "ThesisLibraryReportView",
    components: { ThesisLibraryReportTableComponent, DatePicker, OrganisationUnitAutocompleteSearch },
    setup() {
        const isFormValid = ref(false);
        const reportRequest = ref<ThesisReportRequest>();
        const i18n = useI18n();

        const thesisTypes = computed(() => getThesisTypesForGivenLocale());
        const selectedThesisTypes = ref<{title: string, value: ThesisType}[]>(
            [
                {
                    title: getThesisTitleFromValueAutoLocale(ThesisType.PHD) as string, 
                    value: ThesisType.PHD
                }
            ]
        );
        const selectedOUs = ref<{title: string, value: number}[]>([]);
        const dateFrom = ref("");
        const dateTo = ref("");

        const { requiredSelectionRules } = useValidationUtils();

        onMounted(() => {
            document.title = i18n.t("routeLabel.thesisLibraryReporting");
        });

        const generateReportRequest = () => {
            reportRequest.value = {
                fromDate: dateFrom.value,
                toDate: dateTo.value,
                thesisTypes: selectedThesisTypes.value.map(element => element.value),
                topLevelInstitutionIds: selectedOUs.value.map(selectedOU => selectedOU.value)
            };
        };

        return {
            isFormValid, thesisTypes,
            selectedThesisTypes,
            requiredSelectionRules,
            selectedOUs, dateFrom,
            dateTo, reportRequest,
            generateReportRequest
        };
    }
});
</script>
