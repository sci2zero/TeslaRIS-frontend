<template>
    <submission-page plain :title="$t('createNewPublisherLabel')">
        <publisher-submission-form ref="submissionFormRef" />
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
import PublisherSubmissionForm from "@/components/publisher/PublisherSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitPublisherView",
    components: {PublisherSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof PublisherSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewPublisherLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>