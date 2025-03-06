<template>
    <v-container>
        <h1 class="d-flex justify-center text-center">
            {{ $t("mServiceLabel") }}
        </h1>
  
        <v-form v-model="isFormValid" @submit.prevent>
            <v-row justify="center" class="mt-5">
                <v-col cols="12" sm="6">
                    <v-select
                        v-model="selectedApplicableType"
                        :items="applicableTypes"
                        :label="$t('applicableTypeLabel') + '*'"
                        :rules="requiredStringSelectionRules"
                        return-object
                    ></v-select>
                </v-col>
            </v-row>
            <v-row v-if="selectedApplicableType.value === MServiceApplicableTypes.JOURNAL_PUBLICATION" justify="center" class="mt-5">
                <v-col cols="12" md="6">
                    <journal-autocomplete-search v-model="selectedJournal" required disable-submission></journal-autocomplete-search>
                </v-col>
            </v-row>
            <v-row v-if="selectedApplicableType.value === MServiceApplicableTypes.PROCEEDINGS_PUBLICATION" justify="center" class="mt-5">
                <v-col cols="12" md="6">
                    <event-autocomplete-search v-model="selectedEvent" required disable-submission return-only-non-serial-events></event-autocomplete-search>
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
                        :readonly="selectedApplicableType.value === MServiceApplicableTypes.PROCEEDINGS_PUBLICATION"
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
                    <v-select
                        v-if="selectedApplicableType.value === MServiceApplicableTypes.JOURNAL_PUBLICATION"
                        v-model="selectedJournalPublicationType"
                        :items="journalPublicationTypes"
                        :label="$t('typeOfPublicationLabel') + '*'"
                        :rules="requiredStringSelectionRules"
                        return-object
                    ></v-select>
                    <v-select
                        v-if="selectedApplicableType.value === MServiceApplicableTypes.PROCEEDINGS_PUBLICATION"
                        v-model="selectedProceedingsPublicationType"
                        :items="proceedingsPublicationTypes"
                        :label="$t('typeOfPublicationLabel') + '*'"
                        :rules="requiredStringSelectionRules"
                        return-object
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-radio-group
                        v-model="publicationType"
                        inline
                    >
                        <v-radio
                            :label="$t('experimentalPublicationLabel')"
                            value="experimental"
                            color="primary"
                        ></v-radio>
                        <v-radio
                            :label="$t('theoreticalPublicationLabel')"
                            value="theoretical"
                            color="primary"
                        ></v-radio>
                        <v-radio
                            :label="$t('simulationPublicationLabel')"
                            value="simulation"
                            color="primary"
                        ></v-radio>
                    </v-radio-group>
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

            <i-f-table-component
                v-if="selectedApplicableType.value === MServiceApplicableTypes.JOURNAL_PUBLICATION"
                class="mt-15" :json-data="(ifTableData as IFTableResponse)" :preset-from-year="yearOfPublication - 2" :preset-to-year="yearOfPublication"
                @years-updated="fetchIFTableData"></i-f-table-component>

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
import { computed, defineComponent, watch } from 'vue';
import { ref } from 'vue';
import type { IFTableResponse, ImaginaryPublicationAssessmentRequest, ImaginaryPublicationAssessmentResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import JournalAutocompleteSearch from '@/components/journal/JournalAutocompleteSearch.vue';
import CommissionAutocompleteSearch from '../commission/CommissionAutocompleteSearch.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import IFTableComponent from '@/components/assessment/indicators/IFTableComponent.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { useResearchAreas } from '@/composables/useResearchAreas';
import { JournalPublicationType, MServiceApplicableTypes, ProceedingsPublicationType } from '@/models/PublicationModel';
import { getNameFromOrdinal } from '@/utils/EnumUtil';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';
import { getMServiceApplicableTypesForGivenLocale, getMServiceApplicableTypeTitleFromValueAutoLocale } from '@/i18n/mServiceApplicableTypes';
import { getTypesForGivenLocale as getJournalPublicationTypes, getTitleFromValueAutoLocale as getJournalPublicationTypeTitle } from '@/i18n/journalPublicationType';
import { getTypesForGivenLocale as getProceedingsPublicationTypes, getTitleFromValueAutoLocale as getProceedingsPublicationTypeTitle } from '@/i18n/proceedingsPublicationType';


export default defineComponent({
    name: "JournalMServiceView",
    components: { JournalAutocompleteSearch, CommissionAutocompleteSearch, IFTableComponent, EventAutocompleteSearch },
    setup() {
        const isFormValid = ref(false);
        const ifTableData = ref<IFTableResponse>();

        const { researchAreas } = useResearchAreas();
        const selectedResearchArea = ref<{title: string, value: string}>({title: "", value: ""});

        const applicableTypes = computed(() => getMServiceApplicableTypesForGivenLocale());
        const selectedApplicableType = ref<{title: string, value: MServiceApplicableTypes}>({title: getMServiceApplicableTypeTitleFromValueAutoLocale(MServiceApplicableTypes.JOURNAL_PUBLICATION) as string, value: MServiceApplicableTypes.JOURNAL_PUBLICATION});

        const assessmentResponse = ref<ImaginaryPublicationAssessmentResponse>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedJournal = ref<{title: string, value: number}>(searchPlaceholder);
        const selectedEvent = ref<{title: string, value: number}>(searchPlaceholder);
        const selectedCommission = ref<{title: string, value: number}>(searchPlaceholder);

        watch(selectedEvent, () => {
            if (selectedEvent.value.value) {
                const year = selectedEvent.value.title.split("|")[1].trim();
                yearOfPublication.value = parseInt(year);
            }
        });

        const authorCount = ref(1);
        const yearOfPublication = ref((new Date()).getFullYear());

        const publicationType = ref("experimental");

        const journalPublicationTypes = computed(() => getJournalPublicationTypes());
        const proceedingsPublicationTypes = computed(() => getProceedingsPublicationTypes());
        const selectedJournalPublicationType = ref<{ title: string, value: JournalPublicationType }>({title: getJournalPublicationTypeTitle(JournalPublicationType.RESEARCH_ARTICLE) as string, value: JournalPublicationType.RESEARCH_ARTICLE});
        const selectedProceedingsPublicationType = ref<{ title: string, value: ProceedingsPublicationType }>({title: getProceedingsPublicationTypeTitle(ProceedingsPublicationType.REGULAR_FULL_ARTICLE) as string, value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE});

        const { requiredStringSelectionRules, requiredNumericGreaterThanZeroFieldRules } = useValidationUtils();

        const assessImaginaryPublication = () => {
            const isJournalPublication = selectedApplicableType.value.value === MServiceApplicableTypes.JOURNAL_PUBLICATION;

            const assessmentRequest: ImaginaryPublicationAssessmentRequest = {
                authorCount: authorCount.value,
                classificationYear: yearOfPublication.value,
                researchAreaCode: selectedResearchArea.value.value,
                commissionId: selectedCommission.value.value,
                containingEntityId: isJournalPublication ? selectedJournal.value.value : selectedEvent.value.value,
                experimental: publicationType.value === "experimental",
                theoretical: publicationType.value === "theoretical",
                simulation: publicationType.value === "simulation",
                journalPublicationType: getNameFromOrdinal(JournalPublicationType, selectedJournalPublicationType.value.value) as string,
                proceedingsPublicationType: getNameFromOrdinal(ProceedingsPublicationType, selectedProceedingsPublicationType.value.value) as string
            };

            if (isJournalPublication) {
                AssessmentClassificationService.assessImaginaryJournalPublication(assessmentRequest).then(response => {
                    assessmentResponse.value = response.data;
                });

                fetchIFTableData(yearOfPublication.value - 2, yearOfPublication.value);
            } else {
                AssessmentClassificationService.assessImaginaryProceedingsPublication(assessmentRequest).then(response => {
                    assessmentResponse.value = response.data;
                });
            }
        };

        const fetchIFTableData = (fromYear: number, toYear: number) => {
            EntityIndicatorService.fetchPublicationSeriesIFTableIndicators(selectedJournal.value.value, fromYear, toYear).then(response => {
                ifTableData.value = response.data;
            });
        };

        return {
            researchAreas, selectedResearchArea, selectedEvent,
            isFormValid, selectedJournal, selectedCommission,
            requiredStringSelectionRules, authorCount,
            requiredNumericGreaterThanZeroFieldRules,
            assessImaginaryPublication, yearOfPublication,
            assessmentResponse, returnCurrentLocaleContent,
            ifTableData, publicationType, fetchIFTableData,
            selectedApplicableType, applicableTypes,
            MServiceApplicableTypes, journalPublicationTypes,
            proceedingsPublicationTypes, selectedJournalPublicationType,
            selectedProceedingsPublicationType
        };
    }
});
</script>
