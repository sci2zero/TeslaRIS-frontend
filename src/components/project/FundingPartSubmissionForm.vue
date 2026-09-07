<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="descriptionRef" v-model="description"
                            :initial-value="toMultilingualTextInput(presetFundingPart?.description, languageTags)"
                            is-area
                            :label="$t('descriptionLabel') + '*'"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <monetary-amount-input
                            ref="monetaryAmountRef"
                            v-model="amount"
                            :preset-amount="presetFundingPart?.amount"
                            :required="true"
                        />
                    </v-col>
                </v-row>
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
import { ref, onMounted } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import MonetaryAmountInput from "@/components/core/MonetaryAmountInput.vue";
import type { FundingPart } from '@/models/FundingModel';
import { toMultilingualTextInput } from "@/i18n/MultilingualContentUtil";
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse, MonetaryAmount } from '@/models/Common';

const props = defineProps<{
    edit?: boolean;
    presetFundingPart?: FundingPart;
}>();

const emit = defineEmits<{
    (e: "create", fundingPart: FundingPart): void;
    (e: "update", fundingPart: FundingPart): void;
}>();

const isFormValid = ref(false);

const languageTags = ref<LanguageTagResponse[]>([]);

const description = ref([]);
const descriptionRef = ref<typeof MultilingualTextInput>();

const amount = ref<MonetaryAmount>({ currencyId: 0, amount: 0 });
const monetaryAmountRef = ref<typeof MonetaryAmountInput>();

// No inputs for these - they are used to keep the state of the FundingPart, by keeping the value of each relation
// (BE) update clears all fields and sets their value based on the DTO sent from the FE
const fundingId = ref<number>();
const projectEventId = ref<number>();
const projectDocumentId = ref<number>();
const fundingApplicationId = ref<number>();
const personProjectContributionId = ref<number>();
const organisationUnitProjectContributionId = ref<number>();

onMounted(() => {
    LanguageService.getAllLanguageTags().then(response => {
        languageTags.value = response.data;
    });

    if (props.edit && props.presetFundingPart) {
        amount.value = props.presetFundingPart.amount;
        fundingId.value = props.presetFundingPart.fundingId;
        projectEventId.value = props.presetFundingPart.projectEventId;
        projectDocumentId.value = props.presetFundingPart.projectDocumentId;
        fundingApplicationId.value = props.presetFundingPart.fundingApplicationId;
        personProjectContributionId.value = props.presetFundingPart.personProjectContributionId;
        organisationUnitProjectContributionId.value = props.presetFundingPart.organisationUnitProjectContributionId;
    }
});

const addFundingPart = () => {
    const newFundingPart: FundingPart = {
        description: description.value,
        amount: amount.value,
        fundingId: fundingId.value!,
        projectEventId: projectEventId.value,
        projectDocumentId: projectDocumentId.value,
        fundingApplicationId: fundingApplicationId.value,
        personProjectContributionId: personProjectContributionId.value,
        organisationUnitProjectContributionId: organisationUnitProjectContributionId.value
    };

    if (props.edit) {
        emit("update", newFundingPart);
    } else {
        emit("create", newFundingPart);
    }
};

defineExpose({
    isFormValid,
    addFundingPart
});
</script>