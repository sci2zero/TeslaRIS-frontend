<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("routeLabel.thesisLibraryReporting") }}
    </h1>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center mt-5">
            <v-col cols="12" md="4">
                <v-select
                    v-model="selectedThesisType"
                    :items="thesisTypes"
                    :label="$t('thesisTypeLabel') + '*'"
                    :rules="requiredSelectionRules">
                </v-select>
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
                <v-btn class="mt-3" :disabled="!isFormValid" @click="generateReportRequest">
                    {{ $t("generateLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-form>

    <v-row class="d-flex flex-row justify-center mt-15">
        <v-col cols="12" sm="10" md="8">
            <thesis-library-report-table-component
                :report-request="reportRequest">
            </thesis-library-report-table-component>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import ThesisLibraryReportTableComponent from './ThesisLibraryReportTableComponent.vue';
import { getThesisTitleFromValueAutoLocale, getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { type ThesisReportRequest } from '@/models/ThesisLibraryModel';
import DatePicker from '../core/DatePicker.vue';
import OrganisationUnitAutocompleteSearch from '../organisationUnit/OrganisationUnitAutocompleteSearch.vue';
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
        const selectedThesisType = ref<{title: string, value: ThesisType}>({title: getThesisTitleFromValueAutoLocale(ThesisType.PHD) as string, value: ThesisType.PHD});
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
                thesisType: selectedThesisType.value.value,
                topLevelInstitutionIds: selectedOUs.value.map(selectedOU => selectedOU.value)
            };
        };

        return {
            isFormValid, thesisTypes,
            selectedThesisType,
            requiredSelectionRules,
            selectedOUs, dateFrom,
            dateTo, reportRequest,
            generateReportRequest
        };
    }
});
</script>
