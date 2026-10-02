<template>
    <submission-page plain :title="$t('addGeneticMaterialLabel')">
        <genetic-material-submission-form ref="submissionFormRef" />
        <template #actions>
            <ui-button
                variant="outline"
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitGeneticMaterial(true)"
            >
                {{ $t("saveAndAddAnotherLabel") }}
            </ui-button>
            <ui-button
                :disabled="!submissionFormRef?.isFormValid"
                @click="submissionFormRef?.submitGeneticMaterial(false)"
            >
                {{ $t("saveLabel") }}
            </ui-button>
        </template>
    </submission-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GeneticMaterialSubmissionForm from "@/components/publication/GeneticMaterialSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitGeneticMaterialView",
    components: {GeneticMaterialSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof GeneticMaterialSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addGeneticMaterialLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>
