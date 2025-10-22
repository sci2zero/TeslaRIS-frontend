<template>
    <v-row
        v-if="canEditThesisAttachments || (isArchived && canSeeThesisSectionsWhenArchived) || isOnPublicReview && (!hideEmptySections || (preliminaryFiles && preliminaryFiles.length > 0))"
        class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("preliminaryFilesLabel") }}</h2>
            <attachment-list
                :attachments="preliminaryFiles"
                :can-edit="canEditThesisAttachments"
                :in-comparator="inComparator"
                disable-updates
                :can-make-official="isThesisSection && fileItems && !fileItems.some(f => f.resourceType === ResourceType.OFFICIAL_PUBLICATION || String(f.resourceType) === 'OFFICIAL_PUBLICATION')"
                disable-resource-type-selection
                @create="addThesisAttachment($event, ThesisAttachmentType.FILE, document as Thesis)"
                @delete="deleteThesisAttachment($event, ThesisAttachmentType.FILE, document as Thesis)"
                @update="notifyAboutSectionChange()"
            />
        </v-col>
    </v-row>
    <v-row
        v-if="canEditThesisAttachments || (isArchived && canSeeThesisSectionsWhenArchived) || isOnPublicReview && (!hideEmptySections || (preliminarySupplements && preliminarySupplements.length > 0))"
        class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("preliminarySupplementsLabel") }}</h2>
            <attachment-list
                :attachments="preliminarySupplements"
                :can-edit="canEditThesisAttachments"
                :in-comparator="inComparator"
                disable-updates 
                disable-resource-type-selection
                @create="addThesisAttachment($event, ThesisAttachmentType.SUPPLEMENT, document as Thesis)"
                @delete="deleteThesisAttachment($event, ThesisAttachmentType.SUPPLEMENT, document as Thesis)"
            />
        </v-col>
    </v-row>
    <v-row
        v-if="canEditThesisAttachments || (isArchived && canSeeThesisSectionsWhenArchived) || isOnPublicReview && (!hideEmptySections || (commissionReports && commissionReports.length > 0))"
        class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("commissionReportsLabel") }}</h2>
            <attachment-list
                :attachments="commissionReports" :can-edit="canEditThesisAttachments" :in-comparator="inComparator" 
                disable-updates
                disable-resource-type-selection
                @create="addThesisAttachment($event, ThesisAttachmentType.COMMISSION_REPORT, document as Thesis)"
                @delete="deleteThesisAttachment($event, ThesisAttachmentType.COMMISSION_REPORT, document as Thesis)"
            />
        </v-col>
    </v-row>
    <v-row v-if="!hideRegularSections && (!hideEmptySections || (fileItems && fileItems.length > 0))" class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <attachment-list
                :attachments="fileItems ? fileItems : []"
                :can-edit="canEdit"
                :in-comparator="inComparator"
                @create="addAttachment($event, false, document);"
                @delete="deleteAttachment($event, false, document);"
                @update="updateAttachment($event, false, document);"
            />
        </v-col>
    </v-row>
    <v-row v-if="!hideRegularSections && (!hideEmptySections || (proofs && proofs.length > 0))" class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("proofsLabel") }}</h2>
            <attachment-list
                :attachments="proofs ? proofs : []"
                :can-edit="canEdit"
                is-proof
                :in-comparator="inComparator"
                @create="addAttachment($event, true, document);"
                @delete="deleteAttachment($event, true, document);"
                @update="updateAttachment($event, true, document);"
            />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { computed, defineComponent } from "vue";
import AttachmentList from "./AttachmentList.vue";
import { addAttachment, updateAttachment, deleteAttachment, addThesisAttachment, deleteThesisAttachment } from "@/utils/AttachmentUtil";
import { ResourceType, ThesisAttachmentType, type DocumentFileResponse } from "@/models/DocumentFileModel";
import type { Document, Thesis } from "@/models/PublicationModel";
import { useUserRole } from "@/composables/useUserRole";


export default defineComponent({
  name: "AttachmentSection",
  components: { AttachmentList },
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
        default: []
    },
    preliminarySupplements: {
        type: Array<DocumentFileResponse>,
        default: []
    },
    commissionReports: {
        type: Array<DocumentFileResponse>,
        default: []
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

    const canSeeThesisSectionsWhenArchived = computed(() => {
        return isAdmin.value || isInstitutionalLibrarian.value || isHeadOfLibrary.value
    });

    const notifyAboutSectionChange = () => {
        emit("update");
    };

    return {
        addAttachment, updateAttachment, deleteAttachment,
        canEditThesisAttachments, addThesisAttachment,
        deleteThesisAttachment, ThesisAttachmentType,
        notifyAboutSectionChange, ResourceType,
        canSeeThesisSectionsWhenArchived
    };
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
</style>`
