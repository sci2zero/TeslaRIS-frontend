<template>
    <submission-page plain :title="$t('createNewOULabel')">
        <organisation-unit-submission-form ref="submissionFormRef" />
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
import OrganisationUnitSubmissionForm from "@/components/organisationUnit/OrganisationUnitSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitOrganisationUnitView",
    components: {OrganisationUnitSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof OrganisationUnitSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewOULabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>