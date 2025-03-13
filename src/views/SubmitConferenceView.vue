<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("createNewConferenceLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <conference-submission-form ref="submissionFormRef"></conference-submission-form>
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
import ConferenceSubmissionForm from "@/components/event/ConferenceSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "SubmitConferenceView",
    components: {ConferenceSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof ConferenceSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewConferenceLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>