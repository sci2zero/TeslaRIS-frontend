<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("createNewBookSeriesLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <publication-series-submission-form ref="submissionFormRef" :input-type="inputType"></publication-series-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submit(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submit(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import PublicationSeriesSubmissionForm from "@/components/publicationSeries/PublicationSeriesSubmissionForm.vue";
import { ref } from 'vue';
import { PublicationSeriesType } from '@/models/PublicationSeriesModel';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "SubmitBookSeriesView",
    components: {PublicationSeriesSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof PublicationSeriesSubmissionForm>();
        const inputType = PublicationSeriesType.BOOK_SERIES.toString();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewBookSeriesLabel");
        });

        return {
            submissionFormRef,
            inputType
        };
    }
});
</script>