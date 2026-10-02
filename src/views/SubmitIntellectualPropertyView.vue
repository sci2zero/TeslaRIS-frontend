<template>
    <submission-page plain :title="$t('addIntellectualPropertyLabel')">
        <intellectual-property-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitIntellectualProperty(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitIntellectualProperty(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IntellectualPropertySubmissionForm from "@/components/publication/IntellectualPropertySubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitIntellectualPropertyView",
    components: {IntellectualPropertySubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof IntellectualPropertySubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addIntellectualPropertyLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>