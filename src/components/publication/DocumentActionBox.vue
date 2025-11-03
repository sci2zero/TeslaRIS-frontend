<template>
    <div v-if="!(forProceedings && isResearcher && !canEdit)" class="actions-box pa-4">
        <div class="text-base font-medium mb-3 ml-1 leading-6">
            {{ $t("additionalActionsLabel") }}
        </div>

        <v-row dense>
            <v-col cols="12" sm="6" class="action-section">
                <div class="d-flex flex-row justify-start ml-2">
                    <citation-selector
                        v-if="displayCitation"
                        ref="citationRef"
                        :document-id="documentId">
                    </citation-selector>
                    <publication-unbind-button
                        v-if="canEdit && isResearcher"
                        :document-id="documentId"
                        @unbind="handleResearcherUnbind">
                    </publication-unbind-button>
                    <v-btn
                        v-show="!metadataValid && canEdit && canValidate"
                        class="mb-5 ml-2" color="primary" density="compact"
                        variant="outlined"
                        @click="validateMetadata">
                        {{ $t("validateMetadataLabel") }}
                    </v-btn>
                    <v-btn
                        v-show="!filesValid && canEdit && canValidate"
                        class="mb-5 ml-2" color="primary" density="compact"
                        variant="outlined"
                        @click="validateUploadedFiles">
                        {{ $t("validateUploadedFilesLabel") }}
                    </v-btn>
                    <v-btn
                        v-if="displayArchiveActions && couldArchive && document?.documentDate && (isAdmin || isInstitutionalEditor) && !document?.isArchived"
                        class="mb-5 ml-2" color="primary" density="compact"
                        variant="outlined"
                        @click="changeArchiveState(true)">
                        {{ $t("archiveLabel") }}
                    </v-btn>
                    <v-btn
                        v-if="displayArchiveActions && couldArchive && (isAdmin || isInstitutionalEditor) && document?.isArchived"
                        class="mb-5 ml-2" color="primary" density="compact"
                        variant="outlined"
                        @click="changeArchiveState(false)">
                        {{ $t("unarchiveLabel") }}
                    </v-btn>
                </div>
            </v-col>
            <v-col cols="12" sm="6" class="action-section">
                <publication-badge-section
                    class="move-up"
                    :preloaded-doi="doi"
                    :document-id="documentId"
                    :description="description"
                />
            </v-col>
        </v-row>

        <toast v-model="snackbar" :message="snackbarMessage"></toast>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue';
import CitationSelector from '@/components/publication/CitationSelector.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';
import { useUserRole } from '@/composables/useUserRole';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';
import type { Document } from '@/models/PublicationModel';
import { commitArchiveStateChange } from '@/utils/DocumentUtil';
import Toast from '../core/Toast.vue';
import { useRouter } from 'vue-router';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';


export default defineComponent({
    name: "DocumentActionBox",
    components: { CitationSelector, PublicationBadgeSection, Toast, PublicationUnbindButton },
    props: {
        documentId: {
            type: Number,
            required: true
        },
        doi: {
            type: Object as PropType<string | undefined>,
            required: true
        },
        metadataValid: {
            type: Boolean,
            default: true
        },
        filesValid: {
            type: Boolean,
            default: true
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        couldArchive: {
            type: Boolean,
            default: false
        },
        forProceedings: {
            type: Boolean,
            default: false
        },
        description: {
            type: Object as PropType<string | null>,
            default: undefined
        },
        document: {
            type: Object as PropType<Document | undefined>,
            default: undefined
        },
        displayArchiveActions: {
            type: Boolean,
            default: true
        },
        displayCitation: {
            type: Boolean,
            default: true
        },
        handleResearcherUnbind: {
            type: Function as PropType<((...args: any[]) => any)>,
            default: () => {}
        }
    },
    emits: ["update"],
    setup(props, {emit}) {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const router = useRouter();

        const citationRef = ref<typeof CitationSelector>();

        const {
            isAdmin, isInstitutionalEditor,
            isInstitutionalLibrarian, isResearcher
        } = useUserRole();

        const canValidate = computed(() => isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value)

        const fetchCitations = () => {
            citationRef.value?.fetchCitations();
        };

        const validateMetadata = () => {
            OrganisationUnitTrustConfigurationService.validateDocumentMetadata(
                props.documentId
            ).then(() => {
                emit("update");
            });
        };

        const validateUploadedFiles = () => {
            OrganisationUnitTrustConfigurationService.validateDocumentFiles(
                props.documentId
            ).then(() => {
                emit("update");
            });
        };

        const changeArchiveState = (archive: boolean) => {
            if (!props.document) {
                return;
            }

            commitArchiveStateChange(archive, props.document, snackbar, snackbarMessage, router);
        };
        
        return {
            fetchCitations, canValidate,
            validateMetadata, validateUploadedFiles,
            isAdmin, isInstitutionalEditor,
            changeArchiveState, snackbar,
            snackbarMessage, isResearcher
        };
}})

</script>
