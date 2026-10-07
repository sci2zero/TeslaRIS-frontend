<template>
    <submission-page plain :title="$t('addFundingProgramLabel')">
        <funding-program-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitFundingProgram(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitFundingProgram(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';
import FundingProgramSubmissionForm from "@/components/project/FundingProgramSubmissionForm.vue";

const submissionFormRef = ref<typeof FundingProgramSubmissionForm>();
const i18n = useI18n();

onMounted(() => {
    document.title = i18n.t("addFundingProgramLabel");
});
</script>
