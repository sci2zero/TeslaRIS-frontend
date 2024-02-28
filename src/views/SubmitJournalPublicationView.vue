<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addJournalPublicationLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <journal-publication-submission-form ref="submissionFormRef"></journal-publication-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitJournalPublication(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitJournalPublication(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import JournalPublicationSubmissionForm from "@/components/publication/JournalPublicationSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitJournalPublicationView",
    components: {JournalPublicationSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof JournalPublicationSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>