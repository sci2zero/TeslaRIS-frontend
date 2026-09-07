<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model="doi"
                    label="DOI"
                    placeholder="DOI"
                    :rules="doiValidationRules"
                />
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="grantAgreementId"
                    :label="$t('grantAgreementIdLabel')"
                    :placeholder="$t('grantAgreementIdLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-select
                    v-model="selectedFundingTypes"
                    :label="$t('fundingTypesLabel')"
                    :items="fundingTypeOptions"
                    item-title="title"
                    item-value="value"
                    multiple
                    chips
                    closable-chips
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="dateFrom"
                    :label="$t('dateFromLabel')"
                    color="primary"
                />
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="dateTo"
                    :label="$t('dateToLabel')"
                    color="primary"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="dateSubmitted"
                    :label="$t('dateSubmittedLabel')"
                    color="primary"
                />
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="dateAwarded"
                    :label="$t('dateAwardedLabel')"
                    color="primary"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="displayFunderRef"
                    v-model="displayFunder"
                    :label="$t('funderLabel')"
                    :initial-value="toMultilingualTextInput(presetFunding?.displayFunder, languageTags)"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="displayCallRef"
                    v-model="displayCall"
                    :label="$t('fundingCallLabel')"
                    :initial-value="toMultilingualTextInput(presetFunding?.displayCall, languageTags)"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="displayProgramRef"
                    v-model="displayProgram"
                    :label="$t('fundingProgramLabel')"
                    :initial-value="toMultilingualTextInput(presetFunding?.displayProgram, languageTags)"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <monetary-amount-input
                    ref="amountRef"
                    :preset-amount="props.presetFunding?.amount"
                    @update:model-value="amount = $event"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-checkbox
                    v-model="oaMandated"
                    :label="$t('oaMandatedLabel')"
                />
            </v-col>
            <v-col v-if="oaMandated" cols="6">
                <v-text-field
                    v-model="oaMandateUrl"
                    :label="$t('oaMandateUrlLabel')"
                    :placeholder="$t('oaMandateUrlLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-checkbox
                    v-model="competitive"
                    :label="$t('competitiveLabel')"
                />
            </v-col>
            <v-col cols="6">
                <v-checkbox
                    v-model="renewable"
                    :label="$t('renewableLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-checkbox
                    v-model="internalInvestment"
                    :label="$t('internalInvestmentLabel')"
                />
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
import { ref, computed, watch } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import UriInput from '@/components/core/UriInput.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import type { MonetaryAmount, MultilingualContent } from '@/models/Common';
import type {Funding, FundingType} from '@/models/FundingModel';
import { getFundingTypesForGivenLocale } from '@/i18n/fundingType';

const props = defineProps<{
    presetFunding: Funding | undefined;
}>();

const emit = defineEmits<{
    (e: "update", payload: any): void;
}>();

const isFormValid = ref(false);
const { languageTags } = useLanguageTags();

const { doiValidationRules } = useValidationUtils();

const displayFunderRef = ref<typeof MultilingualTextInput>();
const displayCallRef = ref<typeof MultilingualTextInput>();
const displayProgramRef = ref<typeof MultilingualTextInput>();
const urisRef = ref<typeof UriInput>();
const amountRef = ref<typeof MonetaryAmountInput>();

const doi = ref(props.presetFunding?.doi);
const grantAgreementId = ref(props.presetFunding?.grantAgreementId);
const dateFrom = ref(props.presetFunding?.dateFrom as string);
const dateTo = ref(props.presetFunding?.dateTo as string);
const dateSubmitted = ref(props.presetFunding?.dateSubmitted as string);
const dateAwarded = ref(props.presetFunding?.dateAwarded as string);
const uris = ref<string[]>(props.presetFunding?.uris as string[] ?? []);
const oaMandated = ref<boolean>(props.presetFunding?.oaMandated ?? false);
const oaMandateUrl = ref(props.presetFunding?.oaMandateUrl);
const competitive = ref<boolean>(props.presetFunding?.competitive ?? false);
const renewable = ref<boolean>(props.presetFunding?.renewable ?? false);
const internalInvestment = ref<boolean>(props.presetFunding?.internalInvestment ?? false);

const displayFunder = ref<any>([]);
const displayCall = ref<any>([]);
const displayProgram = ref<any>([]);

const fundingTypeOptions = computed(() => getFundingTypesForGivenLocale());
const selectedFundingTypes = ref<FundingType[]>(props.presetFunding?.fundingTypes ?? []);

const amount = ref<MonetaryAmount | undefined>(props.presetFunding?.amount);

watch(() => props.presetFunding, () => {
    if (props.presetFunding) {
        refreshForm();
    }
});

const refreshForm = () => {
    doi.value = props.presetFunding?.doi;
    grantAgreementId.value = props.presetFunding?.grantAgreementId;
    dateFrom.value = props.presetFunding?.dateFrom as string;
    dateTo.value = props.presetFunding?.dateTo as string;
    dateSubmitted.value = props.presetFunding?.dateSubmitted as string;
    dateAwarded.value = props.presetFunding?.dateAwarded as string;
    oaMandated.value = props.presetFunding?.oaMandated ?? false;
    oaMandateUrl.value = props.presetFunding?.oaMandateUrl;
    competitive.value = props.presetFunding?.competitive ?? false;
    renewable.value = props.presetFunding?.renewable ?? false;
    internalInvestment.value = props.presetFunding?.internalInvestment ?? false;
    selectedFundingTypes.value = props.presetFunding?.fundingTypes ?? [];
    amountRef.value?.setValue(props.presetFunding?.amount);

    displayFunderRef.value?.clearInput();
    displayFunder.value = props.presetFunding?.displayFunder as MultilingualContent[];

    displayCallRef.value?.clearInput();
    displayCall.value = props.presetFunding?.displayCall as MultilingualContent[];

    displayProgramRef.value?.clearInput();
    displayProgram.value = props.presetFunding?.displayProgram as MultilingualContent[];

    urisRef.value?.refreshModelValue(props.presetFunding?.uris as string[] ?? []);
    uris.value = props.presetFunding?.uris as string[] ?? [];

    displayFunderRef.value?.forceRefreshModelValue(toMultilingualTextInput(displayFunder.value, languageTags.value));
    displayCallRef.value?.forceRefreshModelValue(toMultilingualTextInput(displayCall.value, languageTags.value));
    displayProgramRef.value?.forceRefreshModelValue(toMultilingualTextInput(displayProgram.value, languageTags.value));
};

const submit = () => {
    const updatedFunding = {
        doi: doi.value,
        grantAgreementId: grantAgreementId.value,
        fundingTypes: selectedFundingTypes.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        dateSubmitted: dateSubmitted.value,
        dateAwarded: dateAwarded.value,
        displayFunder: displayFunder.value,
        displayCall: displayCall.value,
        displayProgram: displayProgram.value,
        amount: amount.value,
        uris: uris.value,
        oaMandated: oaMandated.value,
        oaMandateUrl: oaMandated.value ? oaMandateUrl.value : undefined,
        competitive: competitive.value,
        renewable: renewable.value,
        internalInvestment: internalInvestment.value
    };

    emit("update", updatedFunding);
};

defineExpose({
    submit,
    isFormValid,
    refreshForm
});
</script>