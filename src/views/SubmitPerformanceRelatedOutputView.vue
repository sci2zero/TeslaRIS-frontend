<template>
    <submission-page plain :title="$t('addPerformanceRelatedOutputLabel')">
        <performance-related-output-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitPerformanceRelatedOutput(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitPerformanceRelatedOutput(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PerformanceRelatedOutputSubmissionForm from "@/components/publication/PerformanceRelatedOutputSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitPerformanceRelatedOutputView",
    components: {PerformanceRelatedOutputSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof PerformanceRelatedOutputSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addPerformanceRelatedOutputLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>
