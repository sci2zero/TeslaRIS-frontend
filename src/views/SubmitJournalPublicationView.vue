<template>
    <submission-page plain :title="$t('addJournalPublicationLabel')">
        <journal-publication-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitJournalPublication(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitJournalPublication(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import JournalPublicationSubmissionForm from "@/components/publication/JournalPublicationSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitJournalPublicationView",
    components: {JournalPublicationSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof JournalPublicationSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addJournalPublicationLabel");
        });
        
        return {
            submissionFormRef
        };
    }
});
</script>