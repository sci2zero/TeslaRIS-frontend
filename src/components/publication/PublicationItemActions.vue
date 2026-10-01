<template>
    <div class="flex flex-wrap items-center gap-1">
        <v-btn v-if="inClaimer" size="small" color="primary" @click.stop="$emit('claim', item.databaseId as number)">
            {{ $t("claimLabel") }}
        </v-btn>
        <v-btn
            v-if="inClaimer"
            class="ml-1"
            size="small"
            color="primary"
            @click.stop="$emit('declineClaim', item.databaseId as number)">
            {{ $t("declineClaimLabel") }}
        </v-btn>
        <entity-classification-modal-content
            v-if="showClassification"
            :entity-id="(item.databaseId as number)"
            :entity-type="ApplicableEntityType.DOCUMENT"
            :applicable-type="getApplicableEntityTypeForDocumentType(item.type)"
            :disabled="!item.year || item.year < 0"
            @classified="$emit('classified', item)"
            @update="$emit('refresh')">
        </entity-classification-modal-content>
        <v-btn
            v-if="validationView"
            size="small"
            color="primary"
            :disabled="item.isApproved"
            @click.stop="$emit('validate', item.databaseId as number, true)">
            {{ $t("validateMetadataLabel") }}
        </v-btn>
        <v-btn
            v-if="validationView"
            class="ml-1"
            size="small"
            color="primary"
            :disabled="item.areFilesValid"
            @click.stop="$emit('validate', item.databaseId as number, false)">
            {{ $t("validateUploadedFilesLabel") }}
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import EntityClassificationModalContent from "../assessment/classifications/EntityClassificationModalContent.vue";
import { ApplicableEntityType } from "@/models/Common";
import { getApplicableEntityTypeForDocumentType } from "@/i18n/applicableEntityType";

defineProps<{
    item: DocumentPublicationIndex;
    inClaimer?: boolean;
    showClassification?: boolean;
    validationView?: boolean;
}>();

defineEmits<{
    claim: [documentId: number];
    declineClaim: [documentId: number];
    classified: [item: DocumentPublicationIndex];
    refresh: [];
    validate: [documentId: number, metadata: boolean];
}>();
</script>
