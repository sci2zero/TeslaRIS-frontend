<template>
    <submission-page plain :title="$t('addMaterialProductLabel')">
        <material-product-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitMaterialProduct(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitMaterialProduct(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MaterialProductSubmissionForm from "@/components/publication/MaterialProductSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitMaterialProductView",
    components: {MaterialProductSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof MaterialProductSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addMaterialProductLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>