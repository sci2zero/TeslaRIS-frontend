<template>
    <v-row v-if="canEdit || (fileItems && fileItems.length > 0)">
        <h2>{{ $t("fileItemsLabel") }}</h2>
        <v-col cols="12">
            <attachment-list
                :attachments="fileItems ? fileItems : []" :can-edit="canEdit" :in-comparator="inComparator" @create="addAttachment($event, false, document)"
                @delete="deleteAttachment($event, false, document)" @update="updateAttachment($event, false, document)"></attachment-list>
        </v-col>
    </v-row>
    <v-row v-if="canEdit || (proofs && proofs.length > 0)" class="mt-10">
        <h2>{{ $t("proofsLabel") }}</h2>
        <v-col cols="12">
            <attachment-list
                :attachments="proofs ? proofs : []" :can-edit="canEdit" is-proof :in-comparator="inComparator"
                @create="addAttachment($event, true, document)" @delete="deleteAttachment($event, true, document)" @update="updateAttachment($event, true, document)"></attachment-list>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent } from "vue";
import AttachmentList from "./AttachmentList.vue";
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import type { DocumentFileResponse } from "@/models/DocumentFileModel";
import type { Document } from "@/models/PublicationModel";


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
    document: {
        type: Object as PropType<Document | undefined>,
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
  setup() {
    return {
        addAttachment, updateAttachment, deleteAttachment
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
