<template>
    <submission-page plain :title="$t('addProceedingsPublicationLabel')">
        <proceedings-publication-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitProceedingsPublication(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitProceedingsPublication(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import ProceedingsPublicationSubmissionForm from "@/components/publication/ProceedingsPublicationSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitProceedingsPublicationView",
    components: {ProceedingsPublicationSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof ProceedingsPublicationSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addProceedingsPublicationLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>