<template>
    <v-card class="pa-3" variant="flat" color="grey-lighten-5">
        <v-card-text class="edit-pen-container">
            <document-file-submission-modal v-if="canEdit" :is-proof="isProof" @create="sendDataToParent"></document-file-submission-modal>

            <v-row>
                <v-list
                    :lines="false"
                    density="compact"
                    class="pa-0"
                >
                    <draggable 
                        :list="attachments" item-key="id"
                        :group="isProof ? 'proofs' : 'fileItems'" 
                        :disabled="false"
                    >
                        <v-list-item
                            v-for="(attachment, attachmentIndex) in attachments" :key="attachmentIndex"
                            :value="attachment.serverFilename"
                            color="primary"
                        >
                            <template #prepend>
                                <v-icon icon="mdi-file-document-outline"></v-icon>
                            </template>

                            <v-list-item-title @click="download(attachment)">
                                {{ getResourceTypeTitleFromValueAutoLocale(attachment.resourceType) }}: {{ attachment.fileName }} ({{ attachment.sizeInMb > 0 ? attachment.sizeInMb : "<1" }}MB)
                            </v-list-item-title>

                            <v-list-item-subtitle>
                                {{ returnCurrentLocaleContent(attachment.description) }}
                            </v-list-item-subtitle>


                            <template #append>
                                <v-row v-if="canEdit">
                                    <v-col>
                                        <v-btn
                                            icon variant="outlined" size="x-small" color="primary"
                                            class="inline-action" @click="sendDeleteRequestToParent(attachment.id)">
                                            <v-icon size="x-large" icon="mdi-delete"></v-icon>
                                        </v-btn>
                                    </v-col>
                                    <v-col>
                                        <document-file-submission-modal :is-proof="isProof" edit :preset-document-file="attachment" @update="sendUpdateRequestToParent($event, attachment.id)"></document-file-submission-modal>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-list-item>
                    </draggable>
                </v-list>
                <h4 v-if="attachments && attachments.length === 0">
                    {{ $t("noFilesUploadedMessage") }}
                </h4>
            </v-row>
        </v-card-text>
    </v-card>

    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ errorMessage }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import type { DocumentFile, DocumentFileResponse } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import { defineComponent, type PropType } from 'vue';
import DocumentFileSubmissionModal from '../documentFile/DocumentFileSubmissionModal.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { VueDraggableNext } from 'vue-draggable-next';
import { getResourceTypeTitleFromValueAutoLocale } from '@/i18n/resourceType';


export default defineComponent({
    name: "AttachmentList",
    components: { DocumentFileSubmissionModal, draggable: VueDraggableNext },
    props: {
        attachments: {
            type: Object as PropType<DocumentFileResponse[]>,
            required: true
        },
        isProof: {
            type: Boolean,
            default: false
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        inComparator: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create", "delete", "update"],
    setup(_, { emit }) {
        const errorMessage = ref("");
        const snackbar = ref(false);

        const i18n = useI18n();

        const download = (attachment: DocumentFileResponse) => {
            DocumentFileService.downloadDocumentFile(attachment.serverFilename, attachment.fileName, attachment.serverFilename.split(".").pop() as string).catch((error) => {
                if(error.response.status === 451) {
                    errorMessage.value = i18n.t("loginToViewDocumentMessage");
                } else {
                    errorMessage.value = i18n.t("genericErrorMessage");
                }
                snackbar.value = true;
            });
        };

        const sendDataToParent = (documentFile: DocumentFile) => {
            emit("create", documentFile);
        };

        const sendUpdateRequestToParent = (documentFile: DocumentFile, attachmentId: number) => {
            documentFile.id = attachmentId;
            emit("update", documentFile);
        };

        const sendDeleteRequestToParent = (attachmentId: number) => {
            emit("delete", attachmentId);
        };

        return {download, sendDataToParent, sendDeleteRequestToParent, 
                sendUpdateRequestToParent, returnCurrentLocaleContent, 
                errorMessage, snackbar, getResourceTypeTitleFromValueAutoLocale};
    }
});
</script>

<style scoped>
    .edit-pen-container {
        position:relative;
    }
</style>
