<template>
    <v-row>
        <v-col cols="11">
            <v-autocomplete
                v-model="selectedFunding"
                :label="$t('fundingLabel')"
                :items="readonly ? [] : fundings"
                :custom-filter="(() => true)"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchFundings($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="FundingSubmissionForm"
                :form-props="{ presetFundingCallId: presetFundingCallId }"
                entity-name="Funding"
                is-submission
                wide
                :read-only="false"
                @create="onFundingCreated"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import lodash from "lodash";
import { useI18n } from "vue-i18n";
import FundingService from "@/services/project/FundingService";
import type { Funding, FundingIndex } from "@/models/FundingModel";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import FundingSubmissionForm from "@/components/project/FundingSubmissionForm.vue";

withDefaults(defineProps<{
    presetFundingCallId?: number;
    readonly?: boolean;
}>(), {
    presetFundingCallId: undefined,
    readonly: false
});

const emit = defineEmits<{
    (e: "selected", payload: { title: string; value: number }): void;
    (e: "create", payload: Funding): void;
}>();

const i18n = useI18n();
const searchPlaceholder = { title: "", value: -1 };

const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

const fundings = ref<{ title: string; value: number; }[]>([]);
const selectedFunding = ref<{ title: string; value: number; }>(searchPlaceholder);

const lastSearchInput = ref("");

const searchFundings = lodash.debounce((input: string) => {
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

        FundingService.searchFunding(params).then((response) => {
            const listOfFundings: { title: string; value: number; }[] = [];
            response.data.content.forEach((funding: FundingIndex) => {
                listOfFundings.push({
                    title: i18n.locale.value.startsWith("sr") ? funding.nameSr : funding.nameOther,
                    value: funding.databaseId
                });
            });

            if (!modalRef.value!.dialog) {
                listOfFundings.push({
                    title: i18n.t("notInListLabel", [input]),
                    value: 0
                });
            }

            fundings.value = listOfFundings;
        });
    }
}, 300);

watch(selectedFunding, () => {
    if (selectedFunding.value && selectedFunding.value.value === 0) {
        modalRef.value!.dialog = true;
        selectedFunding.value = { ...searchPlaceholder };
    }
});

const sendContentToParent = () => {
    if (selectedFunding.value && selectedFunding.value.value > 0) {
        emit("selected", selectedFunding.value);
    }
};

const onFundingCreated = (funding: Funding) => {
    emit("create", funding);
};
</script>
