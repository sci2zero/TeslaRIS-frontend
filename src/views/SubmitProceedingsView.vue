<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addProceedingsLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <proceedings-submission-form ref="submissionFormRef"></proceedings-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitProceedings(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitProceedings(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProceedingsSubmissionForm from "@/components/proceedings/ProceedingsSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

export default defineComponent({
    name: "SubmitProceedingsView",
    components: {ProceedingsSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof ProceedingsSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addProceedingsLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>