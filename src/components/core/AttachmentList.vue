<template>
    <div :class="embedded ? undefined : 'overflow-hidden rounded-xl border border-slate-200 bg-white'">
        <div
            v-if="canEdit && !embedded"
            class="flex justify-end border-b border-slate-100 px-4 py-2">
            <document-file-submission-modal
                :is-proof="isProof"
                :allow-licence-selection="allowLicenceSelection"
                :always-open-access="alwaysOpenAccess"
                :disable-resource-type-selection="disableResourceTypeSelection"
                :allowed-resource-types="allowedResourceTypes"
                @create="sendDataToParent">
                <template #activator="{ props: activatorProps }">
                    <v-btn
                        v-bind="activatorProps"
                        variant="outlined"
                        size="small"
                        class="text-none"
                        prepend-icon="mdi-upload">
                        {{ isProof ? $t("addProofLabel") : $t("addDocumentFileLabel") }}
                    </v-btn>
                </template>
            </document-file-submission-modal>
        </div>

        <div
            v-if="!attachments || attachments.length === 0"
            class="px-4 py-5 text-sm text-slate-500">
            {{ $t("noFilesUploadedMessage") }}
        </div>

        <draggable
            v-else
            :list="attachments"
            item-key="id"
            tag="ul"
            class="divide-y divide-slate-100"
            :group="isProof ? 'proofs' : 'fileItems'"
            :disabled="false">
            <li
                v-for="(attachment, attachmentIndex) in attachments"
                :key="attachment.id ?? attachmentIndex">
                <attachment-element
                    :attachment="attachment"
                    :can-edit="canEdit"
                    :is-proof="isProof"
                    :allow-licence-selection="allowLicenceSelection"
                    :disable-updates="disableUpdates"
                    :disable-resource-type-selection="disableResourceTypeSelection"
                    :allowed-resource-types="allowedResourceTypes"
                    :can-make-official="canMakeOfficial"
                    :can-be-archived="canBeArchived"
                    @delete="sendDeleteRequestToParent(attachment.id)"
                    @update="sendUpdateRequestToParent($event, attachment.id)"
                    @make-official="moveToOfficial(attachment)"
                />
            </li>
        </draggable>
    </div>
</template>

<script lang="ts">
import type { DocumentFile, DocumentFileResponse, ResourceType } from "@/models/DocumentFileModel";
import DocumentFileService from "@/services/DocumentFileService";
import { defineComponent, type PropType } from "vue";
import DocumentFileSubmissionModal from "../documentFile/DocumentFileSubmissionModal.vue";
import { VueDraggableNext } from "vue-draggable-next";
import AttachmentElement from "./AttachmentElement.vue";
import { useRoute } from "vue-router";


export default defineComponent({
    name: "AttachmentList",
    components: { DocumentFileSubmissionModal, draggable: VueDraggableNext, AttachmentElement },
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
        },
        allowLicenceSelection: {
            type: Boolean,
            default: false
        },
        disableUpdates: {
            type: Boolean,
            default: false
        },
        disableResourceTypeSelection: {
            type: Boolean,
            default: false
        },
        canMakeOfficial: {
            type: Boolean,
            default: false
        },
        alwaysOpenAccess: {
            type: Boolean,
            default: false
        },
        canBeArchived: {
            type: Boolean,
            default: false
        },
        embedded: {
            type: Boolean,
            default: false
        },
        allowedResourceTypes: {
            type: Array as PropType<ResourceType[]>,
            default: undefined
        }
    },
    emits: ["create", "delete", "update", "made-official"],
    setup(_, { emit }) {
        const currentRoute = useRoute();

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

        const moveToOfficial = (documentFile: DocumentFileResponse) => {
            DocumentFileService.makeThesisDocumentOfficial(
                parseInt(currentRoute.params.id as string),
                documentFile.id as number
            ).then(() => {
                emit("made-official", documentFile);
            });
        };

        return {
            sendDataToParent,
            sendDeleteRequestToParent,
            sendUpdateRequestToParent,
            moveToOfficial
        };
    }
});
</script>
