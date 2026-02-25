<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addGeneticMaterialLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <genetic-material-submission-form ref="submissionFormRef" />
        <v-row justify="center">
            <v-col cols="1">
                <v-btn
                    color="blue darken-1"
                    :disabled="!submissionFormRef?.isFormValid"
                    class="submission-action"
                    @click="submissionFormRef?.submitGeneticMaterial(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn
                    color="blue darken-1"
                    :disabled="!submissionFormRef?.isFormValid"
                    class="submission-action"
                    @click="submissionFormRef?.submitGeneticMaterial(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GeneticMaterialSubmissionForm from "@/components/publication/GeneticMaterialSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';


export default defineComponent({
    name: "SubmitGeneticMaterialView",
    components: { GeneticMaterialSubmissionForm },
    setup() {
        const submissionFormRef = ref<typeof GeneticMaterialSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addGeneticMaterialLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>
