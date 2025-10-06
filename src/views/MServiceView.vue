<template>
    <v-container>
        <h1 class="d-flex justify-center text-center">
            {{ $t("mServiceLabel") }}
        </h1>
        <div class="d-flex justify-center text-center mb-5">
            <h3 class="description">
                {{ $t("mServiceDescriptionLabel") }}
            </h3>
        </div>
  
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
                    <v-select
                        v-model="selectedCommission"
                        :readonly="!isUserLoggedIn"
                        :items="commissions"
                        :label="$t('commissionLabel') + '*'"
                        return-object
                    />
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
                <v-col cols="12" sm="4" md="2">
                    <vue-recaptcha
                        ref="vueRecaptcha"
                        :sitekey="siteKey"
                        size="normal"
                        theme="light"
                        :hl="locale"
                        :loading-timeout="30000"
                        @verify="handleVerifyCallback"
                        @expire="resetChallenge"
                        @error="resetChallenge">
                    </vue-recaptcha>
                </v-col>
            </v-row>

            <v-row justify="center" class="mt-5">
                <v-col cols="12" sm="6" md="3">
                    <v-btn
                        class="mt-3" color="primary" block :disabled="!isFormValid || !token"
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

            <div ref="assessmentSectionRef">
                <i-f-table-component
                    v-if="selectedApplicableType.value === MServiceApplicableTypes.JOURNAL_PUBLICATION"
                    class="mt-15" :json-data="(ifTableData as IFTableResponse)" :preset-from-year="(yearOfPublication as number) - 2" :preset-to-year="(yearOfPublication as number)"
                    @years-updated="fetchIFTableData"></i-f-table-component>
            </div>
        </v-form>
    </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import type { IFTableResponse, ImaginaryPublicationAssessmentRequest, ImaginaryPublicationAssessmentResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import JournalAutocompleteSearch from '@/components/journal/JournalAutocompleteSearch.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import IFTableComponent from '@/components/assessment/indicators/IFTableComponent.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { useResearchAreas } from '@/composables/useResearchAreas';
import { JournalPublicationType, MServiceApplicableTypes, ProceedingsPublicationType } from '@/models/PublicationModel';
import { getNameFromOrdinal } from '@/utils/EnumUtil';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';
import { getMServiceApplicableTypesForGivenLocale, getMServiceApplicableTypeTitleFromValueAutoLocale } from '@/i18n/mServiceApplicableType';
import { getTypesForGivenLocale as getJournalPublicationTypes, getTitleFromValueAutoLocale as getJournalPublicationTypeTitle } from '@/i18n/journalPublicationType';
import { getTypesForGivenLocale as getProceedingsPublicationTypes, getTitleFromValueAutoLocale as getProceedingsPublicationTypeTitle } from '@/i18n/proceedingsPublicationType';
import VueRecaptcha from 'vue3-recaptcha2';
import { useI18n } from 'vue-i18n';
import { useLoginStore } from '@/stores/loginStore';
import CommissionService from '@/services/assessment/CommissionService';
import { useUserRole } from '@/composables/useUserRole';
import UserService from '@/services/UserService';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';


export default defineComponent({
    name: "JournalMServiceView",
    components: { JournalAutocompleteSearch, IFTableComponent, EventAutocompleteSearch, VueRecaptcha },
    setup() {
        const isFormValid = ref(false);
        const ifTableData = ref<IFTableResponse>();

        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;

        const loginStore = useLoginStore();

        const { isUserLoggedIn, isResearcher } = useUserRole();

        const { researchAreas } = useResearchAreas();
        const selectedResearchArea = ref<{title: string, value: string}>({title: "", value: ""});

        const applicableTypes = computed(() => getMServiceApplicableTypesForGivenLocale());
        const selectedApplicableType = ref<{title: string, value: MServiceApplicableTypes}>({title: getMServiceApplicableTypeTitleFromValueAutoLocale(MServiceApplicableTypes.JOURNAL_PUBLICATION) as string, value: MServiceApplicableTypes.JOURNAL_PUBLICATION});

        const assessmentResponse = ref<ImaginaryPublicationAssessmentResponse>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedJournal = ref<{title: string, value: number}>(searchPlaceholder);
        const selectedEvent = ref<{title: string, value: number}>(searchPlaceholder);

        const commissions = ref<{title: string, value: number}[]>([]);
        const selectedCommission = ref<{title: string, value: number}>(searchPlaceholder);

        const vueRecaptcha = ref<typeof VueRecaptcha>();
        const i18n = useI18n();
        const locale = computed(() => i18n.locale.value);

        const assessmentSectionRef = ref<HTMLElement | null>(null);

        onMounted(async () => {
            document.title = `TeslaRIS - ${i18n.t("routeLabel.mService")}}`;
            fetchCommissions();

            if (isResearcher.value) {
                const userResponse = await UserService.getLoggedInUser();
                const researchAreaResponse =
                    await AssessmentResearchAreaService.readPersonAssessmentResearchArea(userResponse.data.personId);

                if (researchAreaResponse.data) {
                    selectedResearchArea.value = {
                        title: returnCurrentLocaleContent(researchAreaResponse.data.name) as string,
                        value: researchAreaResponse.data.code
                    };
                }
            }
        });

        const fetchCommissions = () => {
            CommissionService.readAllCommissions(true, false).then(response => {
                commissions.value.splice(0)
                response.data.content.forEach(commission => {
                    commissions.value.push(
                        { title: returnCurrentLocaleContent(commission.description) as string, value: commission.id }
                    );
                });
                CommissionService.getDefaultCommissionId().then(resp => {
                    if (resp.data > 0) {
                        selectedCommission.value = commissions.value.find(
                            commission => commission.value === resp.data
                        ) as {title: string, value: number};
                    } else if (commissions.value.length > 0) {
                        selectedCommission.value = commissions.value[0];
                    }
                });
            });
        };

        watch(selectedApplicableType, () => {
            if (selectedApplicableType.value.value === MServiceApplicableTypes.PROCEEDINGS_PUBLICATION) {
                yearOfPublication.value = null;
            } else {
                yearOfPublication.value = (new Date()).getFullYear();
            }
        });

        watch(selectedEvent, () => {
            if (selectedEvent.value.value) {
                const year = selectedEvent.value.title.split("|")[1].trim();
                yearOfPublication.value = parseInt(year);
            }
        });

        const authorCount = ref(1);
        const yearOfPublication = ref<number | null>((new Date()).getFullYear());

        const publicationType = ref("experimental");

        const journalPublicationTypes = computed(() => getJournalPublicationTypes());
        const proceedingsPublicationTypes = computed(() => getProceedingsPublicationTypes());
        const selectedJournalPublicationType = ref<{ title: string, value: JournalPublicationType }>({title: getJournalPublicationTypeTitle(JournalPublicationType.RESEARCH_ARTICLE) as string, value: JournalPublicationType.RESEARCH_ARTICLE});
        const selectedProceedingsPublicationType = ref<{ title: string, value: ProceedingsPublicationType }>({title: getProceedingsPublicationTypeTitle(ProceedingsPublicationType.REGULAR_FULL_ARTICLE) as string, value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE});

        const { requiredStringSelectionRules, requiredNumericGreaterThanZeroFieldRules } = useValidationUtils();

        const token = ref("");

        const assessImaginaryPublication = () => {
            const isJournalPublication = selectedApplicableType.value.value === MServiceApplicableTypes.JOURNAL_PUBLICATION;

            const assessmentRequest: ImaginaryPublicationAssessmentRequest = {
                authorCount: authorCount.value,
                classificationYear: yearOfPublication.value as number,
                researchAreaCode: selectedResearchArea.value.value,
                commissionId: selectedCommission.value.value,
                containingEntityId: isJournalPublication ? selectedJournal.value.value : selectedEvent.value.value,
                experimental: publicationType.value === "experimental",
                theoretical: publicationType.value === "theoretical",
                simulation: publicationType.value === "simulation",
                journalPublicationType: getNameFromOrdinal(JournalPublicationType, selectedJournalPublicationType.value.value) as string,
                proceedingsPublicationType: getNameFromOrdinal(ProceedingsPublicationType, selectedProceedingsPublicationType.value.value) as string,
                captchaToken: token.value
            };

            if (isJournalPublication) {
                AssessmentClassificationService.assessImaginaryJournalPublication(assessmentRequest).then(response => {
                    assessmentResponse.value = response.data;
                    token.value = "";
                    vueRecaptcha.value?.reset();
                    assessmentSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
                });

                fetchIFTableData((yearOfPublication.value as number) - 2, yearOfPublication.value as number);
            } else {
                AssessmentClassificationService.assessImaginaryProceedingsPublication(assessmentRequest).then(response => {
                    assessmentResponse.value = response.data;
                    token.value = "";
                    vueRecaptcha.value?.reset();
                    assessmentSectionRef.value?.scrollIntoView({ behavior: 'smooth' });
                });
            }
        };

        const fetchIFTableData = (fromYear: number, toYear: number) => {
            if (loginStore.userLoggedIn) {
                EntityIndicatorService.fetchPublicationSeriesIFTableIndicators(selectedJournal.value.value, fromYear, toYear).then(response => {
                    ifTableData.value = response.data;
                });       
            }
        };

        const resetChallenge = () => {
            token.value = "";
            vueRecaptcha.value?.reset();
        };
        
        const handleVerifyCallback = (response: string) => {
            token.value = response;
        };

        return {
            researchAreas, selectedResearchArea, selectedEvent,
            isFormValid, selectedJournal, selectedCommission,
            requiredStringSelectionRules, authorCount,
            requiredNumericGreaterThanZeroFieldRules,
            assessImaginaryPublication, yearOfPublication,
            assessmentResponse, returnCurrentLocaleContent,
            ifTableData, publicationType, fetchIFTableData,
            selectedApplicableType, applicableTypes, locale,
            MServiceApplicableTypes, journalPublicationTypes,
            proceedingsPublicationTypes, selectedJournalPublicationType,
            selectedProceedingsPublicationType, resetChallenge,
            handleVerifyCallback, vueRecaptcha, token, siteKey,
            isUserLoggedIn, commissions, assessmentSectionRef
        };
    }
});
</script>

<style scoped>

.description {
    max-width: 950px;
}

</style>
