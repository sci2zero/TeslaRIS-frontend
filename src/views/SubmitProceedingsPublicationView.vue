<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addProceedingsPublicationLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <proceedings-publication-submission-form ref="submissionFormRef"></proceedings-publication-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitProceedingsPublication(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitProceedingsPublication(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import ProceedingsPublicationSubmissionForm from "@/components/publication/ProceedingsPublicationSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "SubmitProceedingsPublicationView",
    components: {ProceedingsPublicationSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof ProceedingsPublicationSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addProceedingsPublicationLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>