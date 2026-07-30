<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model.number="projectId"
                    type="number"
                    :label="$t('projectLabel')"
                    :placeholder="$t('projectLabel')">
                </v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model.number="fundingCallId"
                    type="number"
                    :label="$t('fundingCallLabel')"
                    :placeholder="$t('fundingCallLabel')">
                </v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <person-autocomplete-search
                    v-model="submitter"
                    label="submitterLabel"
                    :required="false">
                </person-autocomplete-search>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <monetary-amount-input
                    ref="requestedAmountRef"
                    :preset-amount="presetFundingApplication?.requestedAmount"
                    @update:model-value="requestedAmount = $event">
                </monetary-amount-input>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    :label="$t('descriptionLabel')"
                    is-area
                    :initial-value="toMultilingualTextInput(presetFundingApplication?.description, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="responseSummaryRef"
                    v-model="responseSummary"
                    :label="$t('responseSummaryLabel')"
                    is-area
                    :initial-value="toMultilingualTextInput(presetFundingApplication?.responseSummary, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="submissionDate"
                    :label="$t('submissionDateLabel')"
                    color="primary">
                </date-picker>
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="decisionDate"
                    :label="$t('dateOfDecisionLabel')"
                    color="primary">
                </date-picker>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="reviewDateFrom"
                    :label="$t('reviewStartedLabel')"
                    color="primary">
                </date-picker>
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="reviewDateTo"
                    :label="$t('reviewEndedLabel')"
                    color="primary">
                </date-picker>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="revisedProposalOrNextRoundDeadlineDate"
                    :label="$t('deadlineForRequestedChangesLabel')"
                    color="primary">
                </date-picker>
            </v-col>
            <v-col cols="6">
                <v-select
                    v-model="result"
                    :label="$t('resultLabel')"
                    :items="resultOptions"
                    item-title="title"
                    item-value="value"
                    clearable>
                </v-select>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model.number="revisedFundingApplicationId"
                    type="number"
                    :label="$t('revisedFundingApplicationLabel')"
                    :placeholder="$t('revisedFundingApplicationLabel')">
                </v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import PersonAutocompleteSearch from '@/components/person/PersonAutocompleteSearch.vue';
import {toMultilingualTextInput} from '@/i18n/MultilingualContentUtil';
import {useLanguageTags} from '@/composables/useLanguageTags';
import type {MonetaryAmount, MultilingualContent} from '@/models/Common';
import {type FundingApplication, FundingApplicationResult} from '@/models/FundingApplicationModel';
import {getFundingApplicationResultsForGivenLocale} from '@/i18n/fundingApplicationResult';
import PersonService from '@/services/PersonService';

const props = defineProps<{
  presetFundingApplication: FundingApplication | undefined;
}>();

const emit = defineEmits<{
  (e: "update", payload: any): void;
}>();

const isFormValid = ref(false);
const { languageTags } = useLanguageTags();

const requestedAmountRef = ref<typeof MonetaryAmountInput>();
const descriptionRef = ref<typeof MultilingualTextInput>();
const responseSummaryRef = ref<typeof MultilingualTextInput>();

const projectId = ref<number | undefined>(props.presetFundingApplication?.projectId);
const fundingCallId = ref<number | undefined>(props.presetFundingApplication?.fundingCallId);
const revisedFundingApplicationId = ref<number | undefined>(props.presetFundingApplication?.revisedFundingApplicationId);

const submitter = ref<{ title: string, value: number } | undefined>(undefined);
const submitterId = ref<number | undefined>(props.presetFundingApplication?.submitterId);

const requestedAmount = ref<MonetaryAmount | undefined>(props.presetFundingApplication?.requestedAmount);
const description = ref<MultilingualContent[]>([]);
const responseSummary = ref<MultilingualContent[]>([]);

const submissionDate = ref(props.presetFundingApplication?.submissionDate as string);
const reviewDateFrom = ref(props.presetFundingApplication?.reviewDateFrom as string);
const reviewDateTo = ref(props.presetFundingApplication?.reviewDateTo as string);
const decisionDate = ref(props.presetFundingApplication?.decisionDate as string);
const revisedProposalOrNextRoundDeadlineDate = ref(props.presetFundingApplication?.revisedProposalOrNextRoundDeadlineDate as string);

const result = ref<FundingApplicationResult | undefined>(props.presetFundingApplication?.result);
const resultOptions = computed(() => getFundingApplicationResultsForGivenLocale());

if (props.presetFundingApplication?.submitterId) {
    PersonService.readPerson(props.presetFundingApplication.submitterId).then((response) => {
        submitter.value = {
            title: `${response.data.personName.firstname} ${response.data.personName.lastname}`,
            value: props.presetFundingApplication?.submitterId as number
        };
    });
}

watch(submitter, () => {
    submitterId.value = submitter.value?.value;
});

watch(() => props.presetFundingApplication, () => {
    if (props.presetFundingApplication) {
        refreshForm();
    }
});

const refreshForm = () => {
    projectId.value = props.presetFundingApplication?.projectId;
    fundingCallId.value = props.presetFundingApplication?.fundingCallId;
    revisedFundingApplicationId.value = props.presetFundingApplication?.revisedFundingApplicationId;
    submitterId.value = props.presetFundingApplication?.submitterId;

    submissionDate.value = props.presetFundingApplication?.submissionDate as string;
    reviewDateFrom.value = props.presetFundingApplication?.reviewDateFrom as string;
    reviewDateTo.value = props.presetFundingApplication?.reviewDateTo as string;
    decisionDate.value = props.presetFundingApplication?.decisionDate as string;
    revisedProposalOrNextRoundDeadlineDate.value = props.presetFundingApplication?.revisedProposalOrNextRoundDeadlineDate as string;

    result.value = props.presetFundingApplication?.result;

    requestedAmountRef.value?.setValue(props.presetFundingApplication?.requestedAmount);

    descriptionRef.value?.clearInput();
    description.value = props.presetFundingApplication?.description as MultilingualContent[];

    responseSummaryRef.value?.clearInput();
    responseSummary.value = props.presetFundingApplication?.responseSummary as MultilingualContent[];

    descriptionRef.value?.forceRefreshModelValue(toMultilingualTextInput(description.value, languageTags.value));
    responseSummaryRef.value?.forceRefreshModelValue(toMultilingualTextInput(responseSummary.value, languageTags.value));

    if (props.presetFundingApplication?.submitterId) {
        PersonService.readPerson(props.presetFundingApplication.submitterId).then((response) => {
            submitter.value = {
                title: `${response.data.personName.firstname} ${response.data.personName.lastname}`,
                value: props.presetFundingApplication?.submitterId as number
            };
        });
    }
};

const submit = () => {
    const updatedFundingApplication = {
        projectId: projectId.value,
        fundingCallId: fundingCallId.value,
        revisedFundingApplicationId: revisedFundingApplicationId.value,
        submitterId: submitterId.value,
        requestedAmount: requestedAmount.value,
        description: description.value,
        responseSummary: responseSummary.value,
        submissionDate: submissionDate.value,
        reviewDateFrom: reviewDateFrom.value,
        reviewDateTo: reviewDateTo.value,
        decisionDate: decisionDate.value,
        revisedProposalOrNextRoundDeadlineDate: revisedProposalOrNextRoundDeadlineDate.value,
        result: result.value
    };

    emit("update", updatedFundingApplication);
};

defineExpose({
    submit,
    isFormValid,
    refreshForm
});
</script>
