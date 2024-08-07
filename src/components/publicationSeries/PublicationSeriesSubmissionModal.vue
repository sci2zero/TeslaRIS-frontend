<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    color="primary" icon v-bind="scope.props" class="bottom-spacer"
                    v-on="scope.isActive">
                    <v-icon>mdi-pencil-plus-outline</v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ inputType === "0" ? $t("addJournalLabel") : $t("addBookSeriesLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <publication-series-submission-form ref="submissionFormRef" :input-type="inputType" in-modal @create="emitToParent"></publication-series-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.submitPublicationSeries(true)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import PublicationSeriesSubmissionForm from "@/components/publicationSeries/PublicationSeriesSubmissionForm.vue";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";


export default defineComponent({
    name: "SubmitPublicationSeriesModal",
    components: { PublicationSeriesSubmissionForm },
    props: {
        inputType: {
            type: String,
            required: true
        },
    },
    emits: ["create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof PublicationSeriesSubmissionForm>();

        const emitToParent = (publicationSeries: PublicationSeries) => {
            emit("create", publicationSeries)
            dialog.value = false;
        }

        return {dialog, submissionFormRef, emitToParent};
    }
});
</script>
