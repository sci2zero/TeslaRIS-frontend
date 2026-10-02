<template>
    <submission-page plain :title="$t('addProjectLabel')">
        <project-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitProject(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitProject(false)"
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
import ProjectSubmissionForm from "@/components/project/ProjectSubmissionForm.vue";

const submissionFormRef = ref<typeof ProjectSubmissionForm>();
const i18n = useI18n();

onMounted(() => {
    document.title = i18n.t("addProjectLabel");
});
</script>
