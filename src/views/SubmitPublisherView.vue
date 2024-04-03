<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addPublisherLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <publisher-submission-form ref="submissionFormRef"></publisher-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitPublisher(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitPublisher(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PublisherSubmissionForm from "@/components/publisher/PublisherSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitPublisherView",
    components: {PublisherSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof PublisherSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>