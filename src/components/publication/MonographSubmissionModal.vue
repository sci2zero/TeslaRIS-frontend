<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    color="primary" icon v-bind="scope.props" class="bottom-spacer"
                    :disabled="readOnly" v-on="scope.isActive">
                    <v-icon>mdi-pencil-plus-outline</v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addMonographLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <monograph-submission-form ref="submissionFormRef" in-modal @create="emitToParent"></monograph-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.submitMonograph(true)">
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
import MonographSubmissionForm from "@/components/publication/MonographSubmissionForm.vue";
import type { Monograph } from "@/models/PublicationModel";


export default defineComponent({
    name: "SubmitMonographModal",
    components: { MonographSubmissionForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
    },
    emits: ["create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof MonographSubmissionForm>();

        const emitToParent = (monograph: Monograph) => {
            emit("create", monograph);
            dialog.value = false;
        }

        return {dialog, submissionFormRef, emitToParent};
    }
});
</script>
