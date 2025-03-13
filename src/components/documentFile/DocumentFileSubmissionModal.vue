<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <div v-if="!edit" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="primary" v-bind="scope.props" class="bottom-spacer"
                        :disabled="readOnly" size="medium" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-upload"></v-icon>
                    </v-btn>
                </div>
                <v-btn
                    v-else icon variant="outlined"
                    color="primary" v-bind="scope.props" class="inline-edit-btn"
                    :disabled="readOnly" size="medium" v-on="scope.isActive">
                    <v-icon size="x-large" icon="mdi-pen"></v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ isProof ? $t("addProofLabel") : $t("addDocumentFileLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <document-file-submission-form
                            ref="submissionFormRef" :edit="edit" :preset-document-file="presetDocumentFile" :is-proof="isProof"
                            :allow-licence-selection="allowLicenceSelection" @create="emitCreateToParent"
                            @update="emitUpdateToParent"></document-file-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.addDocumentFile(true)">
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
import DocumentFileSubmissionForm from "./DocumentFileSubmissionForm.vue";
import type { DocumentFile, DocumentFileResponse } from "@/models/DocumentFileModel";
import type { PropType } from "vue";


export default defineComponent({
    name: "DocumentFileSubmissionModal",
    components: { DocumentFileSubmissionForm },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        isProof: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetDocumentFile: {
            type: Object as PropType<DocumentFileResponse>,
            default: undefined
        },
        allowLicenceSelection: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create", "update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof DocumentFileSubmissionForm>();

        const emitCreateToParent = (documentFile: DocumentFile) => {
            emit("create", documentFile);
            dialog.value = false;
        };

        const emitUpdateToParent = (documentFile: DocumentFile) => {
            emit("update", documentFile);
            dialog.value = false;
        };

        return {dialog, submissionFormRef, emitCreateToParent, emitUpdateToParent};
    }
});
</script>

<style scoped>

.inline-edit-btn {
    margin-top: 13px;
}

</style>
