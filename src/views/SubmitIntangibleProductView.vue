<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addIntangibleProductLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <intangible-product-submission-form ref="submissionFormRef" />
        <v-row justify="center">
            <v-col cols="1">
                <v-btn
                    color="blue darken-1"
                    :disabled="!submissionFormRef?.isFormValid"
                    class="submission-action"
                    @click="submissionFormRef?.submitIntangibleProduct(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn
                    color="blue darken-1"
                    :disabled="!submissionFormRef?.isFormValid"
                    class="submission-action"
                    @click="submissionFormRef?.submitIntangibleProduct(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import IntangibleProductSubmissionForm from "@/components/publication/IntangibleProductSubmissionForm.vue";
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';


export default defineComponent({
    name: "SubmitIntangibleProductView",
    components: {IntangibleProductSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof IntangibleProductSubmissionForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("addIntangibleProductLabel");
        });

        return {
            submissionFormRef
        };
    }
});
</script>