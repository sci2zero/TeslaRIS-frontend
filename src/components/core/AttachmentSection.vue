<template>
    <v-row v-if="canEditThesisAttachments || (preliminaryFiles?.length > 0 && isOnPublicReview)" class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("preliminaryFilesLabel") }}</h2>
            <attachment-list
                :attachments="preliminaryFiles" :can-edit="canEditThesisAttachments" :in-comparator="inComparator"
                allow-licence-selection disable-updates
                disable-resource-type-selection
                @create="addThesisAttachment($event, ThesisAttachmentType.FILE, document as Thesis)"
                @delete="deleteThesisAttachment($event, ThesisAttachmentType.FILE, document as Thesis)"></attachment-list>
        </v-col>
    </v-row>
    <v-row v-if="canEditThesisAttachments || (preliminarySupplements?.length > 0 && isOnPublicReview)" class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("preliminarySupplementsLabel") }}</h2>
            <attachment-list
                :attachments="preliminarySupplements" :can-edit="canEditThesisAttachments" :in-comparator="inComparator" 
                allow-licence-selection disable-updates 
                disable-resource-type-selection
                @create="addThesisAttachment($event, ThesisAttachmentType.SUPPLEMENT, document as Thesis)"
                @delete="deleteThesisAttachment($event, ThesisAttachmentType.SUPPLEMENT, document as Thesis)"></attachment-list>
        </v-col>
    </v-row>
    <v-row v-if="canEditThesisAttachments || (commissionReports?.length > 0 && isOnPublicReview)" class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("commissionReportsLabel") }}</h2>
            <attachment-list
                :attachments="commissionReports" :can-edit="canEditThesisAttachments" :in-comparator="inComparator" 
                allow-licence-selection disable-updates 
                disable-resource-type-selection
                @create="addThesisAttachment($event, ThesisAttachmentType.COMMISSION_REPORT, document as Thesis)"
                @delete="deleteThesisAttachment($event, ThesisAttachmentType.COMMISSION_REPORT, document as Thesis)"></attachment-list>
        </v-col>
    </v-row>
    <v-row v-if="canEdit || (fileItems && fileItems.length > 0)" class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <attachment-list
                :attachments="fileItems ? fileItems : []" :can-edit="canEdit" :in-comparator="inComparator" @create="addAttachment($event, false, document)"
                @delete="deleteAttachment($event, false, document)" @update="updateAttachment($event, false, document)"></attachment-list>
        </v-col>
    </v-row>
    <v-row v-if="canEdit || (proofs && proofs.length > 0)" class="mt-10">
        <v-col cols="12">
            <h2>{{ $t("proofsLabel") }}</h2>
            <attachment-list
                :attachments="proofs ? proofs : []" :can-edit="canEdit" is-proof :in-comparator="inComparator"
                @create="addAttachment($event, true, document)" @delete="deleteAttachment($event, true, document)" @update="updateAttachment($event, true, document)"></attachment-list>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { computed, defineComponent } from "vue";
import AttachmentList from "./AttachmentList.vue";
import { addAttachment, updateAttachment, deleteAttachment, addThesisAttachment, deleteThesisAttachment } from "@/utils/AttachmentUtil";
import { ThesisAttachmentType, type DocumentFileResponse } from "@/models/DocumentFileModel";
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
    }
  },
  emits: ["update:modelValue"],
  setup(props) {
    const { isAdmin, isInstitutionalEditor, isInstitutionalLibrarian } = useUserRole();

    const canEditThesisAttachments = computed(() => 
        (props.canEdit && (isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value)) && props.isThesisSection
    );

    return {
        addAttachment, updateAttachment, deleteAttachment,
        canEditThesisAttachments, addThesisAttachment,
        deleteThesisAttachment, ThesisAttachmentType
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
