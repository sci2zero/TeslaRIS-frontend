<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addMonographPublicationLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <monograph-publication-submission-form ref="submissionFormRef"></monograph-publication-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitMonographPublication(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitMonographPublication(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MonographPublicationSubmissionForm from "@/components/publication/MonographPublicationSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

export default defineComponent({
    name: "SubmitMonographPublicationView",
    components: { MonographPublicationSubmissionForm },
    setup() {
        const submissionFormRef = ref<typeof MonographPublicationSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addMonographPublicationLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>