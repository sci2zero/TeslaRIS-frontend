<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("createNewPublisherLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <publisher-submission-form ref="submissionFormRef"></publisher-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submit(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submit(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PublisherSubmissionForm from "@/components/publisher/PublisherSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

export default defineComponent({
    name: "SubmitPublisherView",
    components: {PublisherSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof PublisherSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("createNewPublisherLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>