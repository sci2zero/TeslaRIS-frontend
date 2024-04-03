<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addConferenceLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <conference-submission-form ref="submissionFormRef"></conference-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.addConference(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.addConference(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ConferenceSubmissionForm from "@/components/event/ConferenceSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitConferenceView",
    components: {ConferenceSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof ConferenceSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>