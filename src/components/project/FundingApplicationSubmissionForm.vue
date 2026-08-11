<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row v-if="!presetProjectId">
            <v-col>
                <project-autocomplete-search v-model="selectedProject" />
            </v-col>
        </v-row>

        <v-row v-if="!presetFundingCallId">
            <v-col>
                <funding-call-autocomplete-search
                    v-model="selectedFundingCall"
                    required
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <person-autocomplete-search
                    v-model="submitter"
                    label="submitterLabel"
                    :required="false"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <monetary-amount-input
                    ref="requestedAmountRef"
                    v-model="requestedAmount"
                    :required="false"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    is-area
                    :label="$t('descriptionLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="responseSummaryRef"
                    v-model="responseSummary"
                    is-area
                    :label="$t('responseSummaryLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-text-field v-model="submissionDate" type="date" :label="$t('submissionDateLabel')" />
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="decisionDate" type="date" :label="$t('dateOfDecisionLabel')" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-text-field v-model="reviewDateFrom" type="date" :label="$t('reviewStartedLabel')" />
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="reviewDateTo" type="date" :label="$t('reviewEndedLabel')" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-text-field v-model="revisedProposalOrNextRoundDeadlineDate" type="date" :label="$t('deadlineForRequestedChangesLabel')" />
            </v-col>
            <v-col cols="6">
                <v-select
                    v-model="result"
                    :label="$t('resultLabel')"
                    :items="resultOptions"
                    item-title="title"
                    item-value="value"
                    clearable
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <funding-application-autocomplete-search
                    v-model="selectedRevisedFundingApplication"
                    label="revisedFundingApplicationLabel"
                />
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="!error ? $t('savedMessage') : errorMessage" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import PersonAutocompleteSearch from '@/components/person/PersonAutocompleteSearch.vue';
import ProjectAutocompleteSearch from '@/components/project/ProjectAutocompleteSearch.vue';
import FundingCallAutocompleteSearch from '@/components/project/FundingCallAutocompleteSearch.vue';
import FundingApplicationAutocompleteSearch from '@/components/project/FundingApplicationAutocompleteSearch.vue';
import Toast from '@/components/core/Toast.vue';
import FundingApplicationService from '@/services/project/FundingApplicationService';
import { FundingApplicationResult, type FundingApplication } from '@/models/FundingApplicationModel';
import { getFundingApplicationResultsForGivenLocale } from '@/i18n/fundingApplicationResult';
import type { MonetaryAmount } from '@/models/Common';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '@/models/Common';

const props = withDefaults(defineProps<{
    presetFundingCallId?: number;
    presetProjectId?: number;
}>(), {
    presetFundingCallId: undefined,
    presetProjectId: undefined
});

const emit = defineEmits<{
  (e: "create", payload: any): void;
}>();

const router = useRouter();
const i18n = useI18n();

const isFormValid = ref(false);
const snackbar = ref(false);
const error = ref(false);
const errorMessage = ref(i18n.t("genericErrorMessage"));

const descriptionRef = ref<InstanceType<typeof MultilingualTextInput>>();
const responseSummaryRef = ref<InstanceType<typeof MultilingualTextInput>>();
const requestedAmountRef = ref<InstanceType<typeof MonetaryAmountInput>>();

const searchPlaceholder = { title: "", value: -1 };

const selectedProject = ref<{ title: string, value: number }>({ ...searchPlaceholder });
const selectedFundingCall = ref<{ title: string, value: number }>({ ...searchPlaceholder });
const selectedRevisedFundingApplication = ref<{ title: string, value: number }>({ ...searchPlaceholder });

const submitter = ref<{ title: string, value: number } | undefined>(undefined);

const requestedAmount = ref<MonetaryAmount | undefined>(undefined);
const description = ref<any[]>([]);
const responseSummary = ref<any[]>([]);

const submissionDate = ref("");
const reviewDateFrom = ref("");
const reviewDateTo = ref("");
const decisionDate = ref("");
const revisedProposalOrNextRoundDeadlineDate = ref("");

const result = ref<FundingApplicationResult | undefined>(undefined);
const resultOptions = computed(() => getFundingApplicationResultsForGivenLocale());

const submitFundingApplication = (stayOnPage: boolean) => {
    const newFundingApplication: FundingApplication = {
        projectId: props.presetProjectId ?? (selectedProject.value.value > 0 ? selectedProject.value.value : undefined),
        fundingCallId: props.presetFundingCallId ?? selectedFundingCall.value.value,
        revisedFundingApplicationId: selectedRevisedFundingApplication.value.value > 0 ? selectedRevisedFundingApplication.value.value : undefined,
        submitterId: submitter.value?.value,
        requestedAmount: requestedAmount.value,
        description: description.value,
        responseSummary: responseSummary.value,
        submissionDate: submissionDate.value || undefined,
        reviewDateFrom: reviewDateFrom.value || undefined,
        reviewDateTo: reviewDateTo.value || undefined,
        decisionDate: decisionDate.value || undefined,
        revisedProposalOrNextRoundDeadlineDate: revisedProposalOrNextRoundDeadlineDate.value || undefined,
        result: result.value,
        otherFundingSources: [],
        documents: []
    };

    FundingApplicationService.createFundingApplication(newFundingApplication).then((response) => {
        emit("create", response.data);

        if (stayOnPage) {
            selectedProject.value = { ...searchPlaceholder };
            selectedFundingCall.value = { ...searchPlaceholder };
            selectedRevisedFundingApplication.value = { ...searchPlaceholder };
            submitter.value = undefined;
            requestedAmountRef.value?.clearInput();
            requestedAmount.value = undefined;
            descriptionRef.value?.clearInput();
            responseSummaryRef.value?.clearInput();
            submissionDate.value = "";
            reviewDateFrom.value = "";
            reviewDateTo.value = "";
            decisionDate.value = "";
            revisedProposalOrNextRoundDeadlineDate.value = "";
            result.value = undefined;
            error.value = false;
            snackbar.value = true;
        } else {
            router.push({ name: "fundingApplicationLandingPage", params: { id: response.data.id } });
        }
    }).catch((axiosError: AxiosError<ErrorResponse>) => {
        const message = i18n.t(axiosError.response?.data.message as string);
        errorMessage.value = message !== axiosError.response?.data.message ? message : i18n.t("genericErrorMessage");
        error.value = true;
        snackbar.value = true;
    });
};

defineExpose({ isFormValid, submit: submitFundingApplication, submitFundingApplication });
</script>
