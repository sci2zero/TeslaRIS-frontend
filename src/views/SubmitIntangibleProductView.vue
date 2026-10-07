<template>
    <submission-page plain :title="$t('addIntangibleProductLabel')">
        <intangible-product-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitIntangibleProduct(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitIntangibleProduct(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IntangibleProductSubmissionForm from "@/components/publication/IntangibleProductSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitIntangibleProductView",
    components: {IntangibleProductSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof IntangibleProductSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addIntangibleProductLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>