<template>
    <v-flex class="text-center">
        <h1>{{ $t("addProceedingsLabel") }}</h1>
    </v-flex>
    <br />
    <br />
    <proceedings-submission-form ref="submissionFormRef"></proceedings-submission-form>
    <v-row justify="center">
        <v-col cols="1">
            <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitProceedings(false)">
                {{ $t("saveLabel") }}
            </v-btn>
        </v-col>
        <v-col cols="3">
            <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" style="margin-top: 20px; margin-bottom: 20px;" @click="submissionFormRef?.submitProceedings(true)">
                {{ $t("saveAndAddAnotherLabel") }}
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProceedingsSubmissionForm from "@/components/proceedings/ProceedingsSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitProceedingsView",
    components: {ProceedingsSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof ProceedingsSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>