<template>
    <v-row>
        <v-col :cols="disableSubmission ? 12 : 11">
            <v-autocomplete
                v-model="selectedFundingProgram"
                :label="(label ? $t(label) : $t('fundingProgramLabel')) + (required ? '*' : '')"
                :items="readOnly ? [] : fundingPrograms"
                :custom-filter="(() => true)"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                :readonly="readOnly"
                return-object
                @update:search="searchFundingPrograms($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col v-if="!disableSubmission" cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="FundingProgramSubmissionForm"
                entity-name="FundingProgram"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedFundingProgram"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import lodash from "lodash";
import { useI18n } from "vue-i18n";
import FundingProgramService from "@/services/project/FundingProgramService";
import type { FundingProgram, FundingProgramIndex } from "@/models/FundingModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { formatAmount } from "@/utils/MonetaryUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import FundingProgramSubmissionForm from "@/components/project/FundingProgramSubmissionForm.vue";

const props = withDefaults(defineProps<{
    modelValue?: { title: string; value: number };
    label?: string;
    funderId?: number;
    required?: boolean;
    readOnly?: boolean;
    disableSubmission?: boolean;
}>(), {
    modelValue: undefined,
    label: "",
    funderId: undefined,
    required: false,
    readOnly: false,
    disableSubmission: false
});

const emit = defineEmits<{
    (e: "update:modelValue", payload: { title: string; value: number }): void;
}>();

const i18n = useI18n();
const searchPlaceholder = { title: "", value: -1 };

const { requiredSelectionRules } = useValidationUtils();

const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

const fundingPrograms = ref<{ title: string; value: number; }[]>([]);
const selectedFundingProgram = ref<{ title: string; value: number; }>(props.modelValue ?? { ...searchPlaceholder });

onMounted(() => {
    if (props.modelValue) {
        selectedFundingProgram.value = props.modelValue;
    }
});

const joinParts = (parts: (string | undefined)[]): string => parts.filter(part => part).join(" | ");

const composeAmount = (amount: number | undefined, currencySymbol: string | undefined): string => {
    return amount ? `${formatAmount(amount, i18n.locale.value)} ${currencySymbol ?? ""}`.trim() : "";
};

const searchFundingPrograms = lodash.debounce((input: string) => {
    if (input.includes("|")) {
        return;
    }

    if (input.length >= 3) {
        let params = "";
        const tokens = input.split(" ");
        tokens.forEach((token) => {
            params += `tokens=${token}&`;
        });
        params += "page=0&size=5";

        FundingProgramService.searchFundingPrograms(params, props.funderId ?? null).then((response) => {
            const listOfFundingPrograms: { title: string; value: number; }[] = [];
            response.data.content.forEach((fundingProgram: FundingProgramIndex) => {
                listOfFundingPrograms.push({
                    title: joinParts([
                        i18n.locale.value.startsWith("sr") ? fundingProgram.nameSr : fundingProgram.nameOther,
                        composeAmount(fundingProgram.totalAmount, fundingProgram.currencySymbol)
                    ]),
                    value: fundingProgram.databaseId
                });
            });

            if (!props.disableSubmission && !modalRef.value!.dialog) {
                listOfFundingPrograms.push({
                    title: i18n.t("notInListLabel", [input]),
                    value: 0
                });
            }

            fundingPrograms.value = listOfFundingPrograms;
        });
    }
}, 300);

watch(selectedFundingProgram, () => {
    if (selectedFundingProgram.value && selectedFundingProgram.value.value === 0) {
        modalRef.value!.dialog = true;
        selectedFundingProgram.value = { ...searchPlaceholder };
        sendContentToParent();
    }
});

watch(() => props.modelValue, () => {
    selectedFundingProgram.value = props.modelValue ?? { ...searchPlaceholder };
});

const sendContentToParent = () => {
    if (selectedFundingProgram.value?.value === 0) {
        return;
    }

    emit("update:modelValue", selectedFundingProgram.value);
};

const selectNewlyAddedFundingProgram = (fundingProgram: FundingProgram) => {
    const toSelect = {
        title: joinParts([
            returnCurrentLocaleContent(fundingProgram.name) ?? "",
            composeAmount(fundingProgram.totalAmount?.amount, fundingProgram.totalAmount?.currencySymbol)
        ]),
        value: fundingProgram.id as number
    };
    fundingPrograms.value.push(toSelect);
    selectedFundingProgram.value = toSelect;
    sendContentToParent();
};
</script>
