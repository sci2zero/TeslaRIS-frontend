<template>
    <submission-page plain :title="$t('createNewJournalLabel')">
        <publication-series-submission-form ref="submissionFormRef" :input-type="inputType" />
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
import PublicationSeriesSubmissionForm from "@/components/publicationSeries/PublicationSeriesSubmissionForm.vue";
import { ref } from 'vue';
import { PublicationSeriesType } from '@/models/PublicationSeriesModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

import SubmissionPage from '@/components/core/SubmissionPage.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitJournalView",
    components: {PublicationSeriesSubmissionForm, SubmissionPage, UiButton},
    setup() {
        const submissionFormRef = ref<typeof PublicationSeriesSubmissionForm>();
        const inputType = PublicationSeriesType.JOURNAL.toString();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewJournalLabel");
        });

        return {
            submissionFormRef,
            inputType
        };
    }
});
</script>