<template>
    <submission-page plain :title="$t('addMonographPublicationLabel')">
        <monograph-publication-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitMonographPublication(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitMonographPublication(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MonographPublicationSubmissionForm from "@/components/publication/MonographPublicationSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitMonographPublicationView",
    components: {MonographPublicationSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof MonographPublicationSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addMonographPublicationLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>