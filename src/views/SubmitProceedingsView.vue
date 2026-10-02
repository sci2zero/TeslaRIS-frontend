<template>
    <submission-page plain :title="$t('createNewProceedingsLabel')">
        <proceedings-submission-form ref="submissionFormRef" />
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
import ProceedingsSubmissionForm from "@/components/proceedings/ProceedingsSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitProceedingsView",
    components: {ProceedingsSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof ProceedingsSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewProceedingsLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>