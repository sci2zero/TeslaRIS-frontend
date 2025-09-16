<template>
    <v-card class="pa-3" variant="flat" color="grey-lighten-5">
        <v-card-text class="edit-pen-container">
            <document-file-submission-modal
                v-if="canEdit"
                :is-proof="isProof"
                :allow-licence-selection="allowLicenceSelection"
                :disable-resource-type-selection="disableResourceTypeSelection"
                @create="sendDataToParent">
            </document-file-submission-modal>

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
                                <c-c-license-badge
                                    v-if="attachment.accessRights.toString() === 'OPEN_ACCESS' && attachment.license"
                                    :license="attachment.license.toLowerCase()"
                                />
                                <v-row v-if="canEdit">
                                    <v-col v-if="!disableUpdates || isInstitutionalLibrarian || isAdmin || isHeadOfLibrary">
                                        <v-btn
                                            icon variant="outlined" size="x-small" color="primary"
                                            class="inline-action" @click="sendDeleteRequestToParent(attachment.id)">
                                            <v-icon size="x-large" icon="mdi-delete"></v-icon>
                                        </v-btn>
                                    </v-col>
                                    <v-col v-if="!disableUpdates">
                                        <document-file-submission-modal
                                            :is-proof="isProof" edit :preset-document-file="attachment"
                                            :allow-licence-selection="allowLicenceSelection"
                                            :disable-resource-type-selection="disableResourceTypeSelection"
                                            @update="sendUpdateRequestToParent($event, attachment.id)"
                                        ></document-file-submission-modal>
                                    </v-col>
                                    <v-col v-if="(canMakeOfficial && canEdit) && (isAdmin || isInstitutionalLibrarian)">
                                        <v-btn
                                            icon variant="outlined" size="x-small" color="primary"
                                            class="inline-action" @click="moveToOfficial(attachment)">
                                            <v-icon size="x-large" icon="mdi-file-move-outline"></v-icon>
                                        </v-btn>
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

    <toast v-model="snackbar" :message="errorMessage" />
</template>

<script lang="ts">
import { License, type DocumentFile, type DocumentFileResponse } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import { defineComponent, type PropType } from 'vue';
import DocumentFileSubmissionModal from '../documentFile/DocumentFileSubmissionModal.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { VueDraggableNext } from 'vue-draggable-next';
import { getResourceTypeTitleFromValueAutoLocale } from '@/i18n/resourceType';
import Toast from './Toast.vue';
import { useUserRole } from '@/composables/useUserRole';
import { getNameFromOrdinal } from '@/utils/EnumUtil';
import CCLicenseBadge from './CCLicenseBadge.vue';
import { useRoute } from 'vue-router';


export default defineComponent({
    name: "AttachmentList",
    components: { DocumentFileSubmissionModal, draggable: VueDraggableNext, Toast, CCLicenseBadge },
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
        }
    },
    emits: ["create", "delete", "update"],
    setup(_, { emit }) {
        const errorMessage = ref("");
        const snackbar = ref(false);

        const { isAdmin, isHeadOfLibrary, isInstitutionalLibrarian } = useUserRole();

        const currentRoute = useRoute();
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

        const moveToOfficial = (documentFile: DocumentFileResponse) => {
            DocumentFileService.makeThesisPreprintOfficial(
                parseInt(currentRoute.params.id as string),
                documentFile.id as number
            ).then(() => {
                emit("update", documentFile);
            });
        };

        return {
            download, sendDataToParent, sendDeleteRequestToParent, 
            sendUpdateRequestToParent, returnCurrentLocaleContent, isAdmin,
            errorMessage, snackbar, getResourceTypeTitleFromValueAutoLocale,
            isHeadOfLibrary, License, getNameFromOrdinal, moveToOfficial,
            isInstitutionalLibrarian
        };
    }
});
</script>

<style scoped>
    .edit-pen-container {
        position:relative;
    }
</style>
