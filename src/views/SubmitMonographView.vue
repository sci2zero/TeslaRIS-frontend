<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addMonographLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <monograph-submission-form ref="submissionFormRef"></monograph-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitMonograph(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitMonograph(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MonographSubmissionForm from "@/components/publication/MonographSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

export default defineComponent({
    name: "SubmitMonographView",
    components: {MonographSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof MonographSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addMonographLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>