<template>
    <submission-page plain :title="$t('addThesisLabel')">
        <thesis-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid || submissionFormRef?.ouAutocompleteRef?.showThesisTypeError"
                @click="submissionFormRef?.submitThesis(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid || submissionFormRef?.ouAutocompleteRef?.showThesisTypeError"
                @click="submissionFormRef?.submitThesis(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ThesisSubmissionForm from "@/components/publication/ThesisSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitThesisView",
    components: {ThesisSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof ThesisSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addThesisLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>