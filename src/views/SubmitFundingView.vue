<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addFundingLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <funding-submission-form ref="submissionFormRef" />
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitFunding(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitFunding(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FundingSubmissionForm from "@/components/project/FundingSubmissionForm.vue";

const submissionFormRef = ref<typeof FundingSubmissionForm>();
const i18n = useI18n();

onMounted(() => {
    document.title = i18n.t("addFundingLabel");
});
</script>