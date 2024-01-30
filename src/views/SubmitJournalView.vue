<template>
    <v-sheet class="text-center">
        <h1>{{ $t("addJournalLabel") }}</h1>
    </v-sheet>
    <br />
    <br />
    <journal-submission-form ref="submissionFormRef"></journal-submission-form>
    <v-row justify="center">
        <v-col cols="1">
            <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitJournal(false)">
                {{ $t("saveLabel") }}
            </v-btn>
        </v-col>
        <v-col cols="3">
            <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitJournal(true)">
                {{ $t("saveAndAddAnotherLabel") }}
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import JournalSubmissionForm from "@/components/journal/JournalSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitJournalView",
    components: {JournalSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof JournalSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>