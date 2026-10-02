<template>
    <submission-page plain :title="$t('addFundingCallLabel')">
        <funding-call-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitFundingCall(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitFundingCall(false)"
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
import FundingCallSubmissionForm from "@/components/project/FundingCallSubmissionForm.vue";

const submissionFormRef = ref<typeof FundingCallSubmissionForm>();
const i18n = useI18n();

onMounted(() => {
    document.title = i18n.t("addFundingCallLabel");
});
</script>
