<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("createNewExhibitionLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <exhibition-submission-form ref="submissionFormRef" />
        <v-row justify="center">
            <v-col cols="1">
                <v-btn
                    color="blue darken-1"
                    :disabled="!submissionFormRef?.isFormValid || !submissionFormRef?.manualValidationsPassed"
                    class="submission-action"
                    @click="submissionFormRef?.submit(false)"
                >
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn
                    color="blue darken-1"
                    :disabled="!submissionFormRef?.isFormValid || !submissionFormRef?.manualValidationsPassed"
                    class="submission-action"
                    @click="submissionFormRef?.submit(true)"
                >
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import ExhibitionSubmissionForm from "@/components/event/ExhibitionSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "SubmitExhibitionView",
    components: {ExhibitionSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof ExhibitionSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewExhibitionLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>
