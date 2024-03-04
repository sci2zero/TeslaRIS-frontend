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
            @click="download(attachment)"
        >
            <template #prepend>
                <v-icon icon="mdi-file-document-outline"></v-icon>
            </template>

            <v-list-item-title>{{ attachment.fileName }} ({{ attachment.sizeInMb }}MB)</v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script lang="ts">
import type { DocumentFileResponse } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import { defineComponent, type PropType } from 'vue';


export default defineComponent({
    name: "AttachmentList",
    props: {
        attachments: {
            type: Object as PropType<DocumentFileResponse[]>,
            required: true
        }
    },
    setup() {
        const download = (attachment: DocumentFileResponse) => {
            DocumentFileService.downloadDocumentFile(attachment.serverFilename, attachment.fileName, attachment.serverFilename.split(".")[-1]);
        };

        return {download};
    }
});
</script>