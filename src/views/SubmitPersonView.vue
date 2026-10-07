<template>
    <submission-page plain :title="$t('createNewPersonLabel')">
        <person-submission-form ref="submissionFormRef" />
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
import PersonSubmissionForm from "@/components/person/PersonSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitConferenceView",
    components: {PersonSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof PersonSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewPersonLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>