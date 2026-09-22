<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <organisation-unit-autocomplete-search
                    v-model="selectedFunder"
                    label="funderLabel"
                    required
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
            <v-col>
                <monetary-amount-input
                    ref="totalAmountRef"
                    :preset-amount="props.presetFundingProgram?.totalAmount"
                    @update:model-value="totalAmount = $event"
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
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import UriInput from '@/components/core/UriInput.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import type { FundingProgram, FundingType } from '@/models/FundingModel';
import { getFundingTypesForGivenLocale } from '@/i18n/fundingType';
import type { MonetaryAmount } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';

const props = defineProps<{
    presetFundingProgram: FundingProgram | undefined;
}>();

const emit = defineEmits<{
    (e: "update", payload: any): void;
}>();

const isFormValid = ref(false);
useLanguageTags();

const urisRef = ref<typeof UriInput>();
const totalAmountRef = ref<typeof MonetaryAmountInput>();

const dateFrom = ref(props.presetFundingProgram?.dateFrom as string);
const dateTo = ref(props.presetFundingProgram?.dateTo as string);
const uris = ref<string[]>(props.presetFundingProgram?.uris as string[] ?? []);
const oaMandated = ref<boolean>(props.presetFundingProgram?.oaMandated ?? false);
const oaMandateUrl = ref(props.presetFundingProgram?.oaMandateUrl);

const fundingTypeOptions = computed(() => getFundingTypesForGivenLocale());
const selectedFundingTypes = ref<FundingType[]>(props.presetFundingProgram?.fundingTypes ?? []);

const totalAmount = ref<MonetaryAmount | undefined>(props.presetFundingProgram?.totalAmount);

const selectedFunder = ref<{ title: string, value: number }>({
    title: returnCurrentLocaleContent(props.presetFundingProgram?.funderName) ?? "",
    value: props.presetFundingProgram?.funderId as number
});

watch(() => props.presetFundingProgram, () => {
    if (props.presetFundingProgram) {
        refreshForm();
    }
});

const refreshForm = () => {
    dateFrom.value = props.presetFundingProgram?.dateFrom as string;
    dateTo.value = props.presetFundingProgram?.dateTo as string;
    oaMandated.value = props.presetFundingProgram?.oaMandated ?? false;
    oaMandateUrl.value = props.presetFundingProgram?.oaMandateUrl;
    selectedFundingTypes.value = props.presetFundingProgram?.fundingTypes ?? [];
    totalAmountRef.value?.setValue(props.presetFundingProgram?.totalAmount);

    selectedFunder.value = {
        title: returnCurrentLocaleContent(props.presetFundingProgram?.funderName) ?? "",
        value: props.presetFundingProgram?.funderId as number
    };

    urisRef.value?.refreshModelValue(props.presetFundingProgram?.uris as string[] ?? []);
    uris.value = props.presetFundingProgram?.uris as string[] ?? [];
};

const submit = () => {
    const updatedFundingProgram = {
        funderId: selectedFunder.value?.value,
        fundingTypes: selectedFundingTypes.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        totalAmount: totalAmount.value,
        uris: uris.value,
        oaMandated: oaMandated.value,
        oaMandateUrl: oaMandated.value ? oaMandateUrl.value : undefined
    };

    emit("update", updatedFundingProgram);
};

defineExpose({
    submit,
    isFormValid,
    refreshForm
});
</script>
