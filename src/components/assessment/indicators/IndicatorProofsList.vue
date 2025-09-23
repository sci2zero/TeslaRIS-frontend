<template>
    <v-list
        :lines="false"
        density="compact"
        class="pa-0"
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
                        <document-file-submission-modal
                            :is-proof="true"
                            edit
                            :preset-document-file="attachment"
                            @update="sendUpdateRequestToParent($event, attachment.id)">
                        </document-file-submission-modal>
                    </v-col>
                </v-row>
            </template>
        </v-list-item>
    </v-list>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import DocumentFileSubmissionModal from '@/components/documentFile/DocumentFileSubmissionModal.vue';
import type { DocumentFile, DocumentFileResponse } from '@/models/DocumentFileModel';
import { getResourceTypeTitleFromValueAutoLocale } from '@/i18n/resourceType';
import DocumentFileService from '@/services/DocumentFileService';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "IndicatorProofsList",
    components: { DocumentFileSubmissionModal, Toast },
    props: {
        attachments: {
            type: Array<DocumentFileResponse>,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update", "delete"],
    setup(_, { emit }) {
        const message = ref("");
        const snackbar = ref(false);
        const i18n = useI18n();

        const download = (attachment: DocumentFileResponse) => {
            DocumentFileService.downloadDocumentFile(
                attachment.serverFilename,
                attachment.fileName,
                attachment.serverFilename.split(".").pop() as string
            ).catch((error) => {
                if(error.response.status === 451) {
                    message.value = i18n.t("loginToViewDocumentMessage");
                } else {
                    message.value = i18n.t("genericErrorMessage");
                }
                snackbar.value = true;
            });
        };

        const sendDeleteRequestToParent = (attachmentId: number) => {
            emit("delete", attachmentId);
        };

        const sendUpdateRequestToParent = (attachment: DocumentFile, attachmentId: number) => {
            attachment.id = attachmentId;
            emit("update", attachment);
        };

        return {
            getResourceTypeTitleFromValueAutoLocale,
            returnCurrentLocaleContent, download,
            sendDeleteRequestToParent, message,
            sendUpdateRequestToParent, snackbar
        };
    }
});
</script>
