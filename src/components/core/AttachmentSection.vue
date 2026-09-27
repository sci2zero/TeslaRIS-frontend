<template>
    <div v-if="visibleSections.length > 0" class="mt-4 space-y-4">
        <landing-section-card
            v-for="section in visibleSections"
            :key="section.key"
            :title="$t(section.titleKey)"
            :count="section.attachments.length"
            :icon="section.icon"
            :icon-class="section.iconClass">
            <template v-if="section.canEdit" #action>
                <document-file-submission-modal
                    :is-proof="section.isProof"
                    :always-open-access="section.alwaysOpenAccess"
                    :disable-resource-type-selection="section.disableResourceTypeSelection"
                    @create="section.onCreate">
                    <template #activator="{ props: activatorProps }">
                        <v-btn
                            v-bind="activatorProps"
                            variant="outlined"
                            size="small"
                            class="text-none"
                            prepend-icon="mdi-upload">
                            {{ section.isProof ? $t("addProofLabel") : $t("addDocumentFileLabel") }}
                        </v-btn>
                    </template>
                </document-file-submission-modal>
            </template>

            <attachment-list
                embedded
                :attachments="section.attachments"
                :can-edit="section.canEdit"
                :is-proof="section.isProof"
                :in-comparator="inComparator"
                :disable-updates="section.disableUpdates"
                :disable-resource-type-selection="section.disableResourceTypeSelection"
                :can-make-official="section.canMakeOfficial"
                :always-open-access="section.alwaysOpenAccess"
                :can-be-archived="section.canBeArchived"
                @create="section.onCreate"
                @delete="section.onDelete"
                @update="section.onUpdate"
                @made-official="section.onMadeOfficial"
            />
        </landing-section-card>
    </div>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { computed, defineComponent } from "vue";
import AttachmentList from "./AttachmentList.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import DocumentFileSubmissionModal from "@/components/documentFile/DocumentFileSubmissionModal.vue";
import { addAttachment, updateAttachment, deleteAttachment, addThesisAttachment, deleteThesisAttachment } from "@/utils/AttachmentUtil";
import { ResourceType, ThesisAttachmentType, type DocumentFile, type DocumentFileResponse } from "@/models/DocumentFileModel";
import type { Document, Thesis } from "@/models/PublicationModel";
import { useUserRole } from "@/composables/useUserRole";

interface AttachmentBlock {
    key: string;
    titleKey: string;
    icon: string;
    iconClass: string;
    attachments: DocumentFileResponse[];
    canEdit: boolean;
    isProof: boolean;
    disableUpdates: boolean;
    disableResourceTypeSelection: boolean;
    canMakeOfficial: boolean;
    alwaysOpenAccess: boolean;
    canBeArchived: boolean;
    visible: boolean;
    onCreate: (file: DocumentFile) => void;
    onDelete: (id: number) => void;
    onUpdate: (file: DocumentFile) => void;
    onMadeOfficial: () => void;
}

export default defineComponent({
    name: "AttachmentSection",
    components: { AttachmentList, LandingSectionCard, DocumentFileSubmissionModal },
    props: {
        proofs: {
            type: Array as PropType<DocumentFileResponse[] | undefined>,
            required: true
        },
        fileItems: {
            type: Array as PropType<DocumentFileResponse[] | undefined>,
            required: true
        },
        preliminaryFiles: {
            type: Array<DocumentFileResponse>,
            default: () => []
        },
        preliminarySupplements: {
            type: Array<DocumentFileResponse>,
            default: () => []
        },
        commissionReports: {
            type: Array<DocumentFileResponse>,
            default: () => []
        },
        isThesisSection: {
            type: Boolean,
            default: false
        },
        isOnPublicReview: {
            type: Boolean,
            default: false
        },
        document: {
            type: Object as PropType<Document | Thesis | undefined>,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        hideEmptySections: {
            type: Boolean,
            default: false
        },
        isArchived: {
            type: Boolean,
            default: false
        },
        hideRegularSections: {
            type: Boolean,
            default: false
        },
        showAllThesisSections: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const {
            isAdmin, isInstitutionalEditor,
            isInstitutionalLibrarian, isHeadOfLibrary
        } = useUserRole();

        const canEditThesisAttachments = computed(() =>
            (
                (props.canEdit && (isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value)) ||
                (isHeadOfLibrary.value && !props.isOnPublicReview)
            ) && props.isThesisSection
        );

        const canSeeThesisSectionsWhenArchived = computed(() =>
            isAdmin.value || isInstitutionalLibrarian.value || isHeadOfLibrary.value
        );

        const thesisFilesCanBeArchived = computed(() => {
            const thesis = props.document as Thesis | undefined;
            return !!thesis?.publicReviewEndDates && thesis.publicReviewEndDates.length > 0;
        });

        const canMakePreliminaryOfficial = computed(() =>
            props.isThesisSection &&
            !!props.fileItems &&
            !props.fileItems.some((file) =>
                file.resourceType === ResourceType.OFFICIAL_PUBLICATION ||
                String(file.resourceType) === "OFFICIAL_PUBLICATION"
            )
        );

        const notifyAboutSectionChange = () => {
            emit("update");
        };

        const showThesisBlock = (items: DocumentFileResponse[] | undefined, gate: boolean) => {
            if (
                props.showAllThesisSections ||
                canEditThesisAttachments.value ||
                (props.isArchived && canSeeThesisSectionsWhenArchived.value)
            ) {
                return true;
            }

            return gate && (!props.hideEmptySections || (items?.length ?? 0) > 0);
        };

        const updateThesisAttachment = (file: DocumentFile) => {
            if (isAdmin.value) {
                updateAttachment(file, false, props.document);
                return;
            }
            notifyAboutSectionChange();
        };

        const visibleSections = computed<AttachmentBlock[]>(() => {
            const thesis = props.document as Thesis | undefined;
            const blocks: AttachmentBlock[] = [
                {
                    key: "preliminaryFiles",
                    titleKey: "preliminaryFilesLabel",
                    icon: "mdi-file-document-outline",
                    iconClass: "bg-indigo-50 text-indigo-600",
                    attachments: props.preliminaryFiles ?? [],
                    canEdit: canEditThesisAttachments.value,
                    isProof: false,
                    disableUpdates: !isAdmin.value,
                    disableResourceTypeSelection: true,
                    canMakeOfficial: canMakePreliminaryOfficial.value,
                    alwaysOpenAccess: false,
                    canBeArchived: thesisFilesCanBeArchived.value,
                    visible: showThesisBlock(props.preliminaryFiles, props.isOnPublicReview),
                    onCreate: (file) => addThesisAttachment(
                        file,
                        ThesisAttachmentType.FILE,
                        thesis,
                        props.document?.fileItems?.length == 0 ? notifyAboutSectionChange : () => {}
                    ),
                    onDelete: (id) => deleteThesisAttachment(id, ThesisAttachmentType.FILE, thesis),
                    onUpdate: updateThesisAttachment,
                    onMadeOfficial: notifyAboutSectionChange
                },
                {
                    key: "preliminarySupplements",
                    titleKey: "preliminarySupplementsLabel",
                    icon: "mdi-file-plus-outline",
                    iconClass: "bg-sky-50 text-sky-700",
                    attachments: props.preliminarySupplements ?? [],
                    canEdit: canEditThesisAttachments.value,
                    isProof: false,
                    disableUpdates: !isAdmin.value,
                    disableResourceTypeSelection: true,
                    canMakeOfficial: false,
                    alwaysOpenAccess: false,
                    canBeArchived: false,
                    visible: showThesisBlock(props.preliminarySupplements, props.isOnPublicReview),
                    onCreate: (file) => addThesisAttachment(file, ThesisAttachmentType.SUPPLEMENT, thesis),
                    onDelete: (id) => deleteThesisAttachment(id, ThesisAttachmentType.SUPPLEMENT, thesis),
                    onUpdate: updateThesisAttachment,
                    onMadeOfficial: notifyAboutSectionChange
                },
                {
                    key: "commissionReports",
                    titleKey: "commissionReportsLabel",
                    icon: "mdi-clipboard-text-outline",
                    iconClass: "bg-orange-50 text-orange-700",
                    attachments: props.commissionReports ?? [],
                    canEdit: canEditThesisAttachments.value,
                    isProof: false,
                    disableUpdates: !isAdmin.value,
                    disableResourceTypeSelection: true,
                    canMakeOfficial: false,
                    alwaysOpenAccess: !isAdmin.value,
                    canBeArchived: thesisFilesCanBeArchived.value,
                    visible: showThesisBlock(props.commissionReports, props.isThesisSection),
                    onCreate: (file) => addThesisAttachment(file, ThesisAttachmentType.COMMISSION_REPORT, thesis),
                    onDelete: (id) => deleteThesisAttachment(id, ThesisAttachmentType.COMMISSION_REPORT, thesis),
                    onUpdate: updateThesisAttachment,
                    onMadeOfficial: notifyAboutSectionChange
                },
                {
                    key: "fileItems",
                    titleKey: "fileItemsLabel",
                    icon: "mdi-file-multiple-outline",
                    iconClass: "bg-emerald-50 text-emerald-700",
                    attachments: props.fileItems ?? [],
                    canEdit: props.canEdit,
                    isProof: false,
                    disableUpdates: false,
                    disableResourceTypeSelection: false,
                    canMakeOfficial: false,
                    alwaysOpenAccess: false,
                    canBeArchived: false,
                    visible: !props.hideRegularSections && (!props.hideEmptySections || (props.fileItems?.length ?? 0) > 0),
                    onCreate: (file) => addAttachment(file, false, props.document),
                    onDelete: (id) => deleteAttachment(id, false, props.document),
                    onUpdate: (file) => updateAttachment(file, false, props.document),
                    onMadeOfficial: () => {}
                },
                {
                    key: "proofs",
                    titleKey: "proofsLabel",
                    icon: "mdi-file-check-outline",
                    iconClass: "bg-amber-50 text-amber-700",
                    attachments: props.proofs ?? [],
                    canEdit: props.canEdit,
                    isProof: true,
                    disableUpdates: false,
                    disableResourceTypeSelection: false,
                    canMakeOfficial: false,
                    alwaysOpenAccess: false,
                    canBeArchived: false,
                    visible: !props.hideRegularSections && (!props.hideEmptySections || (props.proofs?.length ?? 0) > 0),
                    onCreate: (file) => addAttachment(file, true, props.document),
                    onDelete: (id) => deleteAttachment(id, true, props.document),
                    onUpdate: (file) => updateAttachment(file, true, props.document),
                    onMadeOfficial: () => {}
                }
            ];

            return blocks.filter((section) => section.visible);
        });

        return { visibleSections };
    },
});
</script>

<style>
.v-overlay__content:has(> .v-date-picker) {
    min-width: auto!important;
}
.v-picker-title {
    padding: 0 !important;
}
</style>
