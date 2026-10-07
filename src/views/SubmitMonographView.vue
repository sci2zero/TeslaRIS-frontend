<template>
    <submission-page plain :title="$t('createNewMonographLabel')">
        <monograph-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submit(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submit(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MonographSubmissionForm from "@/components/publication/MonographSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitMonographView",
    components: {MonographSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof MonographSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewMonographLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>