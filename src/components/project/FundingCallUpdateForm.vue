<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="nameRef"
                    v-model="name"
                    :rules="requiredFieldRules"
                    :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetFundingCall?.name, languageTags)"
                    is-area />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="nameAbbreviationRef"
                    v-model="nameAbbreviation"
                    :label="$t('nameAbbreviationLabel')"
                    :initial-value="toMultilingualTextInput(presetFundingCall?.nameAbbreviation, languageTags)"
                    is-area />
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
            <v-col>
                <organisation-unit-autocomplete-search
                    v-model:model-value="selectedFunder"
                    :label="$t('funderLabel')"
                    allow-manual-clearing
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
                <v-text-field
                    v-model.number="fundingProgramId"
                    type="number"
                    :min="1"
                    :label="$t('fundingProgramLabel')"
                    :placeholder="$t('fundingProgramLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <monetary-amount-input
                    ref="monetaryAmountRef"
                    :preset-amount="props.presetFundingCall?.monetaryAmount"
                    @update:model-value="monetaryAmount = $event"
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
                <v-switch
                    v-model="oaMandated"
                    :label="$t('oaMandatedLabel')"
                    color="primary"
                    hide-details
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
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import UriInput from '@/components/core/UriInput.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import type { MonetaryAmount, MultilingualContent } from '@/models/Common';
import type { FundingCall } from '@/models/FundingCallModel';
import { FundingType } from '@/models/FundingModel';
import { getFundingTypesForGivenLocale } from '@/i18n/fundingType';

const props = defineProps<{
    presetFundingCall: FundingCall | undefined;
}>();

const emit = defineEmits<{
    (e: "update", payload: any): void;
}>();

const isFormValid = ref(false);
const { languageTags } = useLanguageTags();

const { requiredFieldRules } = useValidationUtils();

const nameRef = ref<typeof MultilingualTextInput>();
const nameAbbreviationRef = ref<typeof MultilingualTextInput>();
const urisRef = ref<typeof UriInput>();
const monetaryAmountRef = ref<typeof MonetaryAmountInput>();

const dateFrom = ref(props.presetFundingCall?.dateFrom as string);
const dateTo = ref(props.presetFundingCall?.dateTo as string);
const uris = ref<string[]>(props.presetFundingCall?.uris as string[] ?? []);
const oaMandated = ref<boolean>(props.presetFundingCall?.oaMandated ?? false);
const oaMandateUrl = ref(props.presetFundingCall?.oaMandateUrl);
const fundingProgramId = ref<number | undefined>(props.presetFundingCall?.fundingProgramId);

const name = ref<any>([]);
const nameAbbreviation = ref<any>([]);

const selectedFunder = ref<{ title: string, value: number }>({ title: "", value: -1 });

const fundingTypeOptions = computed(() => getFundingTypesForGivenLocale());
const selectedFundingTypes = ref<FundingType[]>(props.presetFundingCall?.fundingTypes ?? []);

const monetaryAmount = ref<MonetaryAmount | undefined>(props.presetFundingCall?.monetaryAmount);

onMounted(() => {
    if (props.presetFundingCall?.funderId) {
        refreshForm();
    }
});

watch(() => props.presetFundingCall, () => {
    if (props.presetFundingCall) {
        refreshForm();
    }
});

const refreshForm = () => {
    dateFrom.value = props.presetFundingCall?.dateFrom as string;
    dateTo.value = props.presetFundingCall?.dateTo as string;
    oaMandated.value = props.presetFundingCall?.oaMandated ?? false;
    oaMandateUrl.value = props.presetFundingCall?.oaMandateUrl;
    fundingProgramId.value = props.presetFundingCall?.fundingProgramId;
    selectedFundingTypes.value = props.presetFundingCall?.fundingTypes ?? [];
    monetaryAmountRef.value?.setValue(props.presetFundingCall?.monetaryAmount);

    nameRef.value?.clearInput();
    name.value = props.presetFundingCall?.name as MultilingualContent[];

    nameAbbreviationRef.value?.clearInput();
    nameAbbreviation.value = props.presetFundingCall?.nameAbbreviation as MultilingualContent[];

    urisRef.value?.refreshModelValue(props.presetFundingCall?.uris as string[] ?? []);
    uris.value = props.presetFundingCall?.uris as string[] ?? [];

    nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
    nameAbbreviationRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviation.value, languageTags.value));

    if (props.presetFundingCall?.funderId) {
        OrganisationUnitService.readOU(props.presetFundingCall.funderId).then(response => {
            selectedFunder.value = { title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id as number };
        });
    } else {
        selectedFunder.value = { title: "", value: -1 };
    }
};

const submit = () => {
    const updatedFundingCall = {
        name: name.value,
        nameAbbreviation: nameAbbreviation.value,
        fundingTypes: selectedFundingTypes.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        funderId: selectedFunder.value.value > 0 ? selectedFunder.value.value : undefined,
        fundingProgramId: fundingProgramId.value,
        monetaryAmount: monetaryAmount.value,
        uris: uris.value,
        oaMandated: oaMandated.value,
        oaMandateUrl: oaMandated.value ? oaMandateUrl.value : undefined
    };

    emit("update", updatedFundingCall);
};

defineExpose({
    submit,
    isFormValid,
    refreshForm
});
</script>
