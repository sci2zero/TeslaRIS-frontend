<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addSoftwareLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <software-submission-form ref="submissionFormRef"></software-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitSoftware(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitSoftware(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SoftwareSubmissionForm from "@/components/publication/SoftwareSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

export default defineComponent({
    name: "SubmitDatasetView",
    components: {SoftwareSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof SoftwareSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addSoftwareLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>