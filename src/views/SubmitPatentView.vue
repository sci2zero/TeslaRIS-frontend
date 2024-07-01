<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addPatentLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <patent-submission-form ref="submissionFormRef"></patent-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitPatent(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitPatent(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PatentSubmissionForm from "@/components/publication/PatentSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitPatentView",
    components: {PatentSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof PatentSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>