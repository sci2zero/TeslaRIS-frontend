<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addIntellectualPropertyLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <intellectual-property-submission-form ref="submissionFormRef" />
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitIntellectualProperty(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitIntellectualProperty(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IntellectualPropertySubmissionForm from "@/components/publication/IntellectualPropertySubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

export default defineComponent({
    name: "SubmitIntellectualPropertyView",
    components: {IntellectualPropertySubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof IntellectualPropertySubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addIntellectualPropertyLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>