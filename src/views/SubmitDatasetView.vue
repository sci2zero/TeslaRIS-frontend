<template>
    <v-sheet class="text-center">
        <h1>{{ $t("addDatasetLabel") }}</h1>
    </v-sheet>
    <br />
    <br />
    <dataset-submission-form ref="submissionFormRef"></dataset-submission-form>
    <v-row justify="center">
        <v-col cols="1">
            <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitDataset(false)">
                {{ $t("saveLabel") }}
            </v-btn>
        </v-col>
        <v-col cols="3">
            <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitDataset(true)">
                {{ $t("saveAndAddAnotherLabel") }}
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DatasetSubmissionForm from "@/components/publication/DatasetSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitDatasetView",
    components: {DatasetSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof DatasetSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>