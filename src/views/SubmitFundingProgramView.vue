<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addFundingProgramLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <funding-program-submission-form ref="submissionFormRef" />
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitFundingProgram(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitFundingProgram(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FundingProgramSubmissionForm from "@/components/project/FundingProgramSubmissionForm.vue";

const submissionFormRef = ref<typeof FundingProgramSubmissionForm>();
const i18n = useI18n();

onMounted(() => {
    document.title = i18n.t("addFundingProgramLabel");
});
</script>
