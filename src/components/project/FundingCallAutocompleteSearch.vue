<template>
    <v-row>
        <v-col :cols="disableSubmission ? 12 : 11">
            <v-autocomplete
                v-model="selectedFundingCall"
                :label="(label ? $t(label) : $t('fundingCallLabel')) + (required ? '*' : '')"
                :items="readOnly ? [] : fundingCalls"
                :custom-filter="(() => true)"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                :readonly="readOnly"
                return-object
                @update:search="searchFundingCalls($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col v-if="!disableSubmission" cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="FundingCallSubmissionForm"
                :form-props="{
                    presetFundingProgramId: presetFundingProgramId,
                    presetKeywords: presetKeywords,
                    presetDateFrom: presetDateFrom,
                    presetDateTo: presetDateTo
                }"
                entity-name="FundingCall"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedFundingCall"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import lodash from "lodash";
import { useI18n } from "vue-i18n";
import FundingCallService from "@/services/project/FundingCallService";
import type { FundingCall, FundingCallIndex } from "@/models/FundingCallModel";
import type { MultilingualContent } from "@/models/Common";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { formatAmount } from "@/utils/MonetaryUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import FundingCallSubmissionForm from "@/components/project/FundingCallSubmissionForm.vue";

const props = withDefaults(defineProps<{
    modelValue?: { title: string; value: number };
    label?: string;
    // Prefill the "add new" form only - deliberately NOT a search filter, since the
    // callers use this to attach a call that is not linked to them yet.
    presetFundingProgramId?: number;
    presetKeywords?: MultilingualContent[];
    presetDateFrom?: string;
    presetDateTo?: string;
    required?: boolean;
    readOnly?: boolean;
    disableSubmission?: boolean;
}>(), {
    modelValue: undefined,
    label: "",
    presetFundingProgramId: undefined,
    presetKeywords: () => [],
    presetDateFrom: "",
    presetDateTo: "",
    required: false,
    readOnly: false,
    disableSubmission: false
});

const emit = defineEmits<{
    (e: "update:modelValue", payload: { title: string; value: number }): void;
    (e: "selected", payload: { title: string; value: number }): void;
    (e: "create", payload: FundingCall): void;
}>();

const i18n = useI18n();
const searchPlaceholder = { title: "", value: -1 };

const { requiredSelectionRules } = useValidationUtils();

const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

const fundingCalls = ref<{ title: string; value: number; }[]>([]);
const selectedFundingCall = ref<{ title: string; value: number; }>(props.modelValue ?? { ...searchPlaceholder });

onMounted(() => {
    if (props.modelValue) {
        selectedFundingCall.value = props.modelValue;
    }
});

const joinParts = (parts: (string | undefined)[]): string => parts.filter(part => part).join(" | ");

const composeAmount = (amount: number | undefined, currencySymbol: string | undefined): string => {
    return amount ? `${formatAmount(amount, i18n.locale.value)} ${currencySymbol ?? ""}`.trim() : "";
};

const searchFundingCalls = lodash.debounce((input: string) => {
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

        FundingCallService.searchFundingCalls(params).then((response) => {
            const listOfFundingCalls: { title: string; value: number; }[] = [];
            response.data.content.forEach((fundingCall: FundingCallIndex) => {
                const isSerbian = i18n.locale.value.startsWith("sr");

                listOfFundingCalls.push({
                    title: joinParts([
                        isSerbian ? fundingCall.nameSr : fundingCall.nameOther,
                        isSerbian ? fundingCall.programNameSr : fundingCall.programNameOther,
                        composeAmount(fundingCall.amount, fundingCall.currencySymbol)
                    ]),
                    value: fundingCall.databaseId
                });
            });

            if (!props.disableSubmission && !modalRef.value!.dialog) {
                listOfFundingCalls.push({
                    title: i18n.t("notInListLabel", [input]),
                    value: 0
                });
            }

            fundingCalls.value = listOfFundingCalls;
        });
    }
}, 300);

watch(selectedFundingCall, () => {
    if (selectedFundingCall.value && selectedFundingCall.value.value === 0) {
        modalRef.value!.dialog = true;
        selectedFundingCall.value = { ...searchPlaceholder };
        sendContentToParent();
    }
});

watch(() => props.modelValue, () => {
    selectedFundingCall.value = props.modelValue ?? { ...searchPlaceholder };
});

const sendContentToParent = () => {
    if (selectedFundingCall.value?.value === 0) {
        return;
    }

    emit("update:modelValue", selectedFundingCall.value);

    if ((selectedFundingCall.value?.value ?? 0) > 0) {
        emit("selected", selectedFundingCall.value);
    }
};

const selectNewlyAddedFundingCall = (fundingCall: FundingCall) => {
    const toSelect = {
        title: joinParts([
            returnCurrentLocaleContent(fundingCall.name) ?? "",
            returnCurrentLocaleContent(fundingCall.fundingProgramName) ?? "",
            composeAmount(fundingCall.monetaryAmount?.amount, fundingCall.monetaryAmount?.currencySymbol)
        ]),
        value: fundingCall.id as number
    };
    fundingCalls.value.push(toSelect);
    selectedFundingCall.value = toSelect;

    // Deliberately not routed through sendContentToParent: a freshly created entity
    // must not also fire "selected", or listeners would treat it as a link-existing.
    emit("update:modelValue", toSelect);
    emit("create", fundingCall);
};
</script>
