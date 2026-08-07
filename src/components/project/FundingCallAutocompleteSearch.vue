<template>
    <v-row>
        <v-col cols="11">
            <v-autocomplete
                v-model="selectedFundingCall"
                :label="$t('fundingCallLabel')"
                :items="readonly ? [] : fundingCalls"
                :custom-filter="(() => true)"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchFundingCalls($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col cols="1">
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
                wide
                :read-only="false"
                @create="onFundingCallCreated"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import lodash from "lodash";
import { useI18n } from "vue-i18n";
import FundingCallService from "@/services/project/FundingCallService";
import type { FundingCall, FundingCallIndex } from "@/models/FundingCallModel";
import type { MultilingualContent } from "@/models/Common";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import FundingCallSubmissionForm from "@/components/project/FundingCallSubmissionForm.vue";

withDefaults(defineProps<{
    presetFundingProgramId?: number;
    presetKeywords?: MultilingualContent[];
    presetDateFrom?: string;
    presetDateTo?: string;
    readonly?: boolean;
}>(), {
    presetFundingProgramId: undefined,
    presetKeywords: () => [],
    presetDateFrom: "",
    presetDateTo: "",
    readonly: false
});

const emit = defineEmits<{
    (e: "selected", payload: { title: string; value: number }): void;
    (e: "create", payload: FundingCall): void;
}>();

const i18n = useI18n();
const searchPlaceholder = { title: "", value: -1 };

const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

const fundingCalls = ref<{ title: string; value: number; }[]>([]);
const selectedFundingCall = ref<{ title: string; value: number; }>(searchPlaceholder);

const lastSearchInput = ref("");

const searchFundingCalls = lodash.debounce((input: string) => {
    if (input.includes("|")) {
        return;
    }

    if (input.length >= 3) {
        if (!input.startsWith(i18n.t("notInListLabel", []).slice(0, -3))) {
            lastSearchInput.value = input;
        }

        let params = "";
        const tokens = input.split(" ");
        tokens.forEach((token) => {
            params += `tokens=${token}&`;
        });
        params += "page=0&size=5";

        FundingCallService.searchFundingCalls(params).then((response) => {
            const listOfFundingCalls: { title: string; value: number; }[] = [];
            response.data.content.forEach((fundingCall: FundingCallIndex) => {
                listOfFundingCalls.push({
                    title: i18n.locale.value.startsWith("sr") ? fundingCall.nameSr : fundingCall.nameOther,
                    value: fundingCall.databaseId
                });
            });

            if (!modalRef.value!.dialog) {
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
    }
});

const sendContentToParent = () => {
    if (selectedFundingCall.value && selectedFundingCall.value.value > 0) {
        emit("selected", selectedFundingCall.value);
    }
};

const onFundingCallCreated = (fundingCall: FundingCall) => {
    emit("create", fundingCall);
};
</script>
