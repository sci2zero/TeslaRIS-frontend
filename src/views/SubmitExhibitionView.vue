<template>
    <submission-page plain :title="$t('createNewExhibitionLabel')">
        <exhibition-submission-form ref="submissionFormRef" />
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
import ExhibitionSubmissionForm from "@/components/event/ExhibitionSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitExhibitionView",
    components: {ExhibitionSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof ExhibitionSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewExhibitionLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>
