<template>
    <v-row>
        <v-col :cols="disableSubmission ? 12 : 11">
            <v-autocomplete
                v-model="selectedFundingApplication"
                :label="(label ? $t(label) : $t('fundingApplicationLabel')) + (required ? '*' : '')"
                :items="readOnly ? [] : fundingApplications"
                :custom-filter="(() => true)"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                :readonly="readOnly"
                return-object
                @update:search="searchFundingApplications($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col v-if="!disableSubmission" cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="FundingApplicationSubmissionForm"
                :form-props="{ presetFundingCallId: presetFundingCallId, presetProjectId: presetProjectId }"
                entity-name="FundingApplication"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedFundingApplication"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, watch } from "vue";
import lodash from "lodash";
import { useI18n } from "vue-i18n";
import FundingApplicationService from "@/services/project/FundingApplicationService";
import type { FundingApplication, FundingApplicationIndex } from "@/models/FundingApplicationModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";

// Loaded asynchronously because FundingApplicationSubmissionForm uses this
// component for its "revised application" field - a static import would be circular.
const FundingApplicationSubmissionForm = defineAsyncComponent(
    () => import("@/components/project/FundingApplicationSubmissionForm.vue")
);

const props = withDefaults(defineProps<{
    modelValue?: { title: string; value: number };
    label?: string;
    // Prefill the "add new" form only - deliberately NOT a search filter, since the
    // callers use this to attach an application that is not linked to them yet.
    presetProjectId?: number;
    presetFundingCallId?: number;
    required?: boolean;
    readOnly?: boolean;
    disableSubmission?: boolean;
}>(), {
    modelValue: undefined,
    label: "",
    presetProjectId: undefined,
    presetFundingCallId: undefined,
    required: false,
    readOnly: false,
    disableSubmission: false
});

const emit = defineEmits<{
    (e: "update:modelValue", payload: { title: string; value: number }): void;
    (e: "selected", payload: { title: string; value: number }): void;
    (e: "create", payload: FundingApplication): void;
}>();

const i18n = useI18n();
const searchPlaceholder = { title: "", value: -1 };

const { requiredSelectionRules } = useValidationUtils();

const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

const fundingApplications = ref<{ title: string; value: number; }[]>([]);
const selectedFundingApplication = ref<{ title: string; value: number; }>(props.modelValue ?? { ...searchPlaceholder });

onMounted(() => {
    if (props.modelValue) {
        selectedFundingApplication.value = props.modelValue;
    }
});

const composeTitle = (nameParts: (string | undefined)[], databaseId: number): string => {
    const title = nameParts.filter(namePart => namePart).join(" | ");
    return title.length > 0 ? title : `#${databaseId}`;
};

const searchFundingApplications = lodash.debounce((input: string) => {
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

        FundingApplicationService.searchFundingApplications(params).then((response) => {
            const listOfFundingApplications: { title: string; value: number; }[] = [];
            response.data.content.forEach((fundingApplication: FundingApplicationIndex) => {
                const isSerbian = i18n.locale.value.startsWith("sr");
                const description = isSerbian ? fundingApplication.descriptionSr : fundingApplication.descriptionOther;

                listOfFundingApplications.push({
                    // Description is not in the ES index yet, so fall back to the names
                    // of the call and the project until it is.
                    title: description ?? composeTitle([
                        isSerbian ? fundingApplication.fundingCallNameSr : fundingApplication.fundingCallNameOther,
                        isSerbian ? fundingApplication.projectNameSr : fundingApplication.projectNameOther
                    ], fundingApplication.databaseId),
                    value: fundingApplication.databaseId
                });
            });

            if (!props.disableSubmission && !modalRef.value!.dialog) {
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
        sendContentToParent();
    }
});

watch(() => props.modelValue, () => {
    selectedFundingApplication.value = props.modelValue ?? { ...searchPlaceholder };
});

const sendContentToParent = () => {
    if (selectedFundingApplication.value?.value === 0) {
        return;
    }

    emit("update:modelValue", selectedFundingApplication.value);

    if ((selectedFundingApplication.value?.value ?? 0) > 0) {
        emit("selected", selectedFundingApplication.value);
    }
};

const selectNewlyAddedFundingApplication = (fundingApplication: FundingApplication) => {
    const toSelect = {
        title: returnCurrentLocaleContent(fundingApplication.description) ?? `#${fundingApplication.id}`,
        value: fundingApplication.id as number
    };
    fundingApplications.value.push(toSelect);
    selectedFundingApplication.value = toSelect;

    // Deliberately not routed through sendContentToParent: a freshly created entity
    // must not also fire "selected", or listeners would treat it as a link-existing.
    emit("update:modelValue", toSelect);
    emit("create", fundingApplication);
};
</script>
