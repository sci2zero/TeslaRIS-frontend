<template>
    <v-row>
        <v-col cols="11">
            <v-autocomplete
                v-model="selectedFundingApplication"
                :label="$t('fundingApplicationLabel')"
                :items="readonly ? [] : fundingApplications"
                :custom-filter="(() => true)"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchFundingApplications($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="FundingApplicationSubmissionForm"
                :form-props="{ presetFundingCallId: presetFundingCallId }"
                entity-name="FundingApplication"
                is-submission
                wide
                :read-only="false"
                @create="onFundingApplicationCreated"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import lodash from "lodash";
import { useI18n } from "vue-i18n";
import FundingApplicationService from "@/services/project/FundingApplicationService";
import type { FundingApplication, FundingApplicationIndex } from "@/models/FundingApplicationModel";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import FundingApplicationSubmissionForm from "@/components/project/FundingApplicationSubmissionForm.vue";

withDefaults(defineProps<{
    presetFundingCallId?: number;
    readonly?: boolean;
}>(), {
    presetFundingCallId: undefined,
    readonly: false
});

const emit = defineEmits<{
    (e: "selected", payload: { title: string; value: number }): void;
    (e: "create", payload: FundingApplication): void;
}>();

const i18n = useI18n();
const searchPlaceholder = { title: "", value: -1 };

const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

const fundingApplications = ref<{ title: string; value: number; }[]>([]);
const selectedFundingApplication = ref<{ title: string; value: number; }>(searchPlaceholder);

const lastSearchInput = ref("");

const buildTitle = (fundingApplication: FundingApplicationIndex) => {
    const isSr = i18n.locale.value.startsWith("sr");
    const projectName = isSr ? fundingApplication.projectNameSr : fundingApplication.projectNameOther;
    const callName = isSr ? fundingApplication.fundingCallNameSr : fundingApplication.fundingCallNameOther;
    const combined = [projectName, callName].filter(part => part).join(" — ");
    return combined || `#${fundingApplication.databaseId}`;
};

const searchFundingApplications = lodash.debounce((input: string) => {
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

        FundingApplicationService.searchFundingApplications(params).then((response) => {
            const listOfFundingApplications: { title: string; value: number; }[] = [];
            response.data.content.forEach((fundingApplication: FundingApplicationIndex) => {
                listOfFundingApplications.push({
                    title: buildTitle(fundingApplication),
                    value: fundingApplication.databaseId
                });
            });

            if (!modalRef.value!.dialog) {
                listOfFundingApplications.push({
                    title: i18n.t("notInListLabel", [input]),
                    value: 0
                });
            }

            fundingApplications.value = listOfFundingApplications;
        });
    }
}, 300);

watch(selectedFundingApplication, () => {
    if (selectedFundingApplication.value && selectedFundingApplication.value.value === 0) {
        modalRef.value!.dialog = true;
        selectedFundingApplication.value = { ...searchPlaceholder };
    }
});

const sendContentToParent = () => {
    if (selectedFundingApplication.value && selectedFundingApplication.value.value > 0) {
        emit("selected", selectedFundingApplication.value);
    }
};

const onFundingApplicationCreated = (fundingApplication: FundingApplication) => {
    emit("create", fundingApplication);
};
</script>
