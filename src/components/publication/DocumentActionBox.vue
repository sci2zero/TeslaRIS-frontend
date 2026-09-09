<template>
    <div v-if="!(forProceedings && isResearcher && !canEdit)" class="mb-8">
        <citation-selector
            v-if="displayCitation"
            ref="citationRef"
            hide-activator
            :document-id="documentId"
        />
        <publication-unbind-button
            v-if="canEdit && isResearcher"
            ref="unbindRef"
            hide-activator
            :document-id="documentId"
            @unbind="handleResearcherUnbind"
        />
        <generic-crud-modal
            v-if="isAdmin && transferTo"
            ref="transferModalRef"
            hide-activator
            :form-component="PublicationTypeTransferForm"
            :form-props="{ documentId: documentId, transferTo: transferTo }"
            :entity-name="'TypeTransfer' + typeTransferSuffix"
            :read-only="false"
            wide
        />

        <div class="flex flex-col sm:flex-row flex-wrap gap-3">
            <UiButton
                v-if="displayCitation"
                variant="outline"
                size="md"
                class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                @click="openCitationDialog"
            >
                <span class="mdi mdi-format-quote-close"></span>
                {{ $t("citePublicationLabel") }}
            </UiButton>

            <v-menu v-if="hasMoreActions" location="bottom">
                <template #activator="{ props: menuProps }">
                    <UiButton
                        variant="outline"
                        size="md"
                        class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                        v-bind="menuProps"
                    >
                        <span class="mdi mdi-dots-horizontal"></span>
                        {{ $t("moreActionsLabel") }}
                        <span class="mdi mdi-chevron-down"></span>
                    </UiButton>
                </template>
                <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                    <v-list-item
                        v-if="isUserLoggedIn"
                        prepend-icon="mdi-download"
                        :title="$t('downloadRoCrateLabel')"
                        @click="downloadRoCrate"
                    />
                    <v-list-item
                        v-if="canEdit && isResearcher"
                        prepend-icon="mdi-account-remove-outline"
                        :title="$t('removeFromPublicationLabel')"
                        @click="openUnbindDialog"
                    />
                    <v-list-item
                        v-if="!metadataValid && canEdit && canValidate"
                        prepend-icon="mdi-check-decagram-outline"
                        :title="$t('validateMetadataLabel')"
                        @click="validateMetadata"
                    />
                    <v-list-item
                        v-if="!filesValid && canEdit && canValidate"
                        prepend-icon="mdi-file-check-outline"
                        :title="$t('validateUploadedFilesLabel')"
                        @click="validateUploadedFiles"
                    />
                    <v-list-item
                        v-if="canShowArchive"
                        prepend-icon="mdi-archive-outline"
                        :title="$t('archiveLabel')"
                        @click="changeArchiveState(true)"
                    />
                    <v-list-item
                        v-if="canShowUnarchive"
                        prepend-icon="mdi-archive-arrow-up-outline"
                        :title="$t('unarchiveLabel')"
                        @click="changeArchiveState(false)"
                    />
                    <v-list-item
                        v-if="isAdmin && transferTo"
                        prepend-icon="mdi-swap-horizontal"
                        :title="$t('createNewTypeTransfer' + typeTransferSuffix + 'Label')"
                        @click="openTransferModal"
                    />
                    <v-list-item
                        v-if="canScanMetadata"
                        prepend-icon="mdi-magnify-plus-outline"
                        :title="$t('scanForMetadataEnrichmentsLabel')"
                        @click="scanForMetadataEnrichment"
                    />
                </v-list>
            </v-menu>
        </div>

        <publication-badge-section
            class="mt-6"
            :preloaded-doi="doi"
            :document-id="documentId"
            :description="description"
        />

        <toast v-model="snackbar" :message="snackbarMessage"></toast>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue';
import CitationSelector from '@/components/publication/CitationSelector.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';
import { useUserRole } from '@/composables/useUserRole';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';
import type { Document, PublicationType } from '@/models/PublicationModel';
import { commitArchiveStateChange } from '@/utils/DocumentUtil';
import Toast from '../core/Toast.vue';
import { useRoute, useRouter } from 'vue-router';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import RoCrateService from '@/services/export/RoCrateService';
import PublicationTypeTransferForm from './PublicationTypeTransferForm.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ImportService from '@/services/importer/ImportService';
import { useGlobalLoading } from '@/composables/useGlobalLoading';
import { useI18n } from 'vue-i18n';
import { UiButton } from '@/components/ui/button';


export default defineComponent({
    name: "DocumentActionBox",
    components: { CitationSelector, PublicationBadgeSection, Toast, PublicationUnbindButton, GenericCrudModal, UiButton },
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
        },
        transferTo: {
            type: Object as PropType<PublicationType | undefined>,
            default: undefined
        },
        typeTransferSuffix: {
            type: String,
            default: ""
        },
        enableMetadataScanning: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(props, {emit}) {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const citationRef = ref<{ dialog: boolean, fetchCitations: () => void } | null>(null);
        const unbindRef = ref<{ unbindResearcherFromDocument: () => void } | null>(null);
        const transferModalRef = ref<{ dialog: boolean } | null>(null);

        const {
            isAdmin, isInstitutionalEditor,
            isInstitutionalLibrarian, isResearcher,
            isUserLoggedIn
        } = useUserRole();

        const canValidate = computed(() => isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value);

        const canShowArchive = computed(() =>
            props.displayArchiveActions && props.couldArchive && !!props.document?.documentDate?.year
            && (isAdmin.value || isInstitutionalEditor.value) && !props.document?.isArchived
        );

        const canShowUnarchive = computed(() =>
            props.displayArchiveActions && props.couldArchive
            && (isAdmin.value || isInstitutionalEditor.value) && !!props.document?.isArchived
        );

        const canScanMetadata = computed(() =>
            props.enableMetadataScanning && props.canEdit
            && (isAdmin.value || isInstitutionalEditor.value || isResearcher.value)
            && !props.document?.isArchived
        );

        const hasMoreActions = computed(() =>
            isUserLoggedIn.value
            || (props.canEdit && isResearcher.value)
            || (!props.metadataValid && props.canEdit && canValidate.value)
            || (!props.filesValid && props.canEdit && canValidate.value)
            || canShowArchive.value
            || canShowUnarchive.value
            || !!(isAdmin.value && props.transferTo)
            || canScanMetadata.value
        );

        const fetchCitations = () => {
            citationRef.value?.fetchCitations();
        };

        const openCitationDialog = () => {
            if (citationRef.value) {
                citationRef.value.dialog = true;
            }
        };

        const openUnbindDialog = () => {
            unbindRef.value?.unbindResearcherFromDocument();
        };

        const openTransferModal = () => {
            if (transferModalRef.value) {
                transferModalRef.value.dialog = true;
            }
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

        const downloadRoCrate = () => {
            RoCrateService.downloadRoCrateForSingleDocument(
                parseInt(currentRoute.params.id as string)
            );
        };

        const { showLoader, hideLoader } = useGlobalLoading();
        const i18n = useI18n();

        const scanForMetadataEnrichment = async () => {
            try {
                showLoader(i18n.t("scanningExternalSourcesMessage"));
                const response = await ImportService.scanDocumentForMetadataEnrichment(props.documentId);

                if (response.data) {
                    router.push({name: "loader", query: {recordId: response.data, documentId: props.documentId}});
                } else {
                    snackbarMessage.value = i18n.t("noNewMetadataFoundMessage");
                }
            } finally {
                hideLoader();
            }
        };
        
        return {
            fetchCitations, canValidate,
            validateMetadata, validateUploadedFiles,
            isAdmin, isInstitutionalEditor,
            changeArchiveState, snackbar,
            snackbarMessage, isResearcher,
            isUserLoggedIn, downloadRoCrate,
            PublicationTypeTransferForm,
            scanForMetadataEnrichment,
            citationRef, unbindRef, transferModalRef,
            hasMoreActions, canShowArchive, canShowUnarchive, canScanMetadata,
            openCitationDialog, openUnbindDialog, openTransferModal
        };
}})
</script>
