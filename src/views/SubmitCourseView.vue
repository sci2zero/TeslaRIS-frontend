<template>
    <submission-page plain :title="$t('createNewCourseLabel')">
        <course-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid || !submissionFormRef?.manualValidationsPassed"
                @click="submissionFormRef?.submit(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid || !submissionFormRef?.manualValidationsPassed"
                @click="submissionFormRef?.submit(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import CourseSubmissionForm from "@/components/event/CourseSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitCourseView",
    components: {CourseSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof CourseSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewCourseLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>
