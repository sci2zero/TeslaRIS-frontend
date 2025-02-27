<template>
    <v-container>
        <h1 class="d-flex justify-center text-center">
            {{ $t("journalMServiceLabel") }}
        </h1>
  
        <v-form v-model="isFormValid" @submit.prevent>
            <v-row justify="center" class="mt-5">
                <v-col cols="12" md="6">
                    <journal-autocomplete-search v-model="selectedJournal" required disable-submission></journal-autocomplete-search>
                </v-col>
            </v-row>
  
            <v-row justify="center" class="mt-5">
                <v-col cols="12" sm="6" md="3">
                    <commission-autocomplete-search v-model="selectedCommission" only-load-commissions required></commission-autocomplete-search>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-select
                        v-model="selectedResearchArea"
                        :items="researchAreas"
                        :label="$t('researchAreaLabel') + '*'"
                        :rules="requiredStringSelectionRules"
                        return-object
                    ></v-select>
                </v-col>
            </v-row>
  
            <v-row justify="center" class="mt-5">
                <v-col cols="12" sm="6" md="3">
                    <v-text-field
                        v-model="yearOfPublication"
                        type="number"
                        :label="$t('yearOfPublicationLabel') + '*'"
                        :placeholder="$t('yearOfPublicationLabel') + '*'"
                        :rules="requiredNumericGreaterThanZeroFieldRules"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-text-field
                        v-model="authorCount"
                        type="number"
                        :label="$t('authorCountLabel') + '*'"
                        :placeholder="$t('authorCountLabel') + '*'"
                        :rules="requiredNumericGreaterThanZeroFieldRules"
                    ></v-text-field>
                </v-col>
            </v-row>
  
            <v-row justify="center" class="mt-5">
                <v-col cols="12" sm="6" md="3">
                    <v-btn
                        class="mt-3" color="primary" block :disabled="!isFormValid"
                        @click="assessImaginaryPublication">
                        {{ $t("assessPublicationLabel") }}
                    </v-btn>
                </v-col>
            </v-row>

            <h2 v-if="assessmentResponse" class="mt-15">
                {{ $t("assessmentResultsLabel") }}
            </h2>
            <v-container v-if="assessmentResponse && assessmentResponse.assessmentCode">
                <v-row>
                    <v-col cols="12" md="4">
                        <strong>{{ $t("assessmentCodeLabel") }}:</strong>
                    </v-col>
                    <v-col cols="12" md="8">
                        {{ assessmentResponse?.assessmentCode }}
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" md="4">
                        <strong>{{ $t("assessmentReasonLabel") }}:</strong>
                    </v-col>
                    <v-col cols="12" md="8">
                        {{ returnCurrentLocaleContent(assessmentResponse?.assessmentReason) }}
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" md="4">
                        <strong>{{ $t("rawPointsLabel") }}:</strong>
                    </v-col>
                    <v-col cols="12" md="8">
                        {{ assessmentResponse?.rawPoints }}
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" md="4">
                        <strong>{{ $t("rawPointsReasonLabel") }}:</strong>
                    </v-col>
                    <v-col cols="12" md="8">
                        {{ returnCurrentLocaleContent(assessmentResponse?.rawPointsReason) }}
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" md="4">
                        <strong>{{ $t("scaledPointsLabel") }}:</strong>
                    </v-col>
                    <v-col cols="12" md="8">
                        {{ assessmentResponse?.scaledPoints }}
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" md="4">
                        <strong>{{ $t("scaledPointsReasonLabel") }}:</strong>
                    </v-col>
                    <v-col cols="12" md="8">
                        {{ returnCurrentLocaleContent(assessmentResponse?.scaledPointsReason) }}
                    </v-col>
                </v-row>
            </v-container>
            <h3 v-if="assessmentResponse && !assessmentResponse.assessmentCode">
                {{ $t("noAssessmentForSelectionMessage") }}
            </h3>
        </v-form>
    </v-container>
</template>  

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref } from 'vue';
import type { ImaginaryJournalPublicationAssessmentRequest, ImaginaryJournalPublicationAssessmentResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import JournalAutocompleteSearch from '@/components/journal/JournalAutocompleteSearch.vue';
import CommissionAutocompleteSearch from '../commission/CommissionAutocompleteSearch.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';


export default defineComponent({
    name: "JournalMServiceView",
    components: { JournalAutocompleteSearch, CommissionAutocompleteSearch },
    setup() {
        const isFormValid = ref(false);

        const researchAreas = ref<{title: string, value: string}[]>([]);
        const selectedResearchArea = ref<{title: string, value: string}>({title: "", value: ""});

        const assessmentResponse = ref<ImaginaryJournalPublicationAssessmentResponse>();

        onMounted(() => {
            AssessmentResearchAreaService.readAssessmentResearchAreas().then(response => {
                response.data.forEach(researchArea => {
                    researchAreas.value.push({title: returnCurrentLocaleContent(researchArea.name) as string, value: researchArea.code});
                });
            });
        });

        const searchPlaceholder = {title: "", value: -1};
        const selectedJournal = ref<{title: string, value: number}>(searchPlaceholder);
        const selectedCommission = ref<{title: string, value: number}>(searchPlaceholder);

        const authorCount = ref(1);
        const yearOfPublication = ref((new Date()).getFullYear());

        const { requiredStringSelectionRules, requiredNumericGreaterThanZeroFieldRules } = useValidationUtils();

        const assessImaginaryPublication = () => {
            const assessmentRequest: ImaginaryJournalPublicationAssessmentRequest = {
                authorCount: authorCount.value,
                classificationYear: yearOfPublication.value,
                researchAreaCode: selectedResearchArea.value.value,
                commissionId: selectedCommission.value.value,
                journalId: selectedJournal.value.value
            };

            AssessmentClassificationService.assessImaginaryJournalPublication(assessmentRequest).then(response => {
                assessmentResponse.value = response.data;
            });
        };

        return {
            researchAreas, selectedResearchArea,
            isFormValid, selectedJournal, selectedCommission,
            requiredStringSelectionRules, authorCount,
            requiredNumericGreaterThanZeroFieldRules,
            assessImaginaryPublication, yearOfPublication,
            assessmentResponse, returnCurrentLocaleContent
        };
    }
});
</script>
