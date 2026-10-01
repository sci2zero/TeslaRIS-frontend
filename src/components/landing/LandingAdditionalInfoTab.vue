<template>
    <div class="mt-4 space-y-4">
        <landing-section-card
            v-if="$slots.details"
            :title="$t('basicInfoLabel')"
            icon="mdi-book-open-page-variant-outline"
            icon-class="bg-blue-50 text-blue-600"
            padded
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <slot name="details"></slot>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="document"
            :title="$t('identifiersLabel')"
            icon="mdi-identifier"
            icon-class="bg-indigo-50 text-indigo-600"
            padded
        >
            <document-common-fields-display
                :document="document"
                :cols="12"
                :can-edit="canEdit"
                :containing-entity-type="containingEntityType"
                :concrete-entity-type="concreteEntityType"
                :document-identifiers="documentIdentifiers"
                @identifiers-updated="$emit('identifiers-updated')"
            />
        </landing-section-card>

        <slot name="before-keywords"></slot>

        <keyword-list
            v-if="keywords !== undefined"
            :keywords="keywords"
            :can-edit="canEdit"
            @search-keyword="$emit('search-keyword', $event)"
            @update="$emit('update-keywords', $event)"
        />

        <slot name="after-keywords"></slot>

        <description-section
            v-if="description !== undefined"
            :description="description"
            :can-edit="canEdit"
            :is-general-description="isGeneralDescription"
            @update="$emit('update-description', $event)"
        />
        <description-section
            v-if="showRemark"
            :description="remark"
            :can-edit="canEdit"
            is-remark
            @update="$emit('update-remark', $event)"
        />

        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import DocumentCommonFieldsDisplay from "@/components/publication/DocumentCommonFieldsDisplay.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import { ApplicableEntityType, type MultilingualContent } from "@/models/Common";
import type { Document } from "@/models/PublicationModel";
import type { EntityIdentifierResponse } from "@/models/IdentifierModel";

withDefaults(defineProps<{
    keywords?: MultilingualContent[];
    description?: MultilingualContent[];
    remark?: MultilingualContent[];
    canEdit?: boolean;
    isGeneralDescription?: boolean;
    showRemark?: boolean;
    document?: Document;
    containingEntityType?: ApplicableEntityType;
    concreteEntityType?: ApplicableEntityType;
    documentIdentifiers?: EntityIdentifierResponse[];
}>(), {
    canEdit: false,
    isGeneralDescription: false,
    showRemark: true,
    containingEntityType: ApplicableEntityType.DOCUMENT,
    concreteEntityType: ApplicableEntityType.DOCUMENT,
    documentIdentifiers: () => [],
});

defineEmits<{
    (e: "search-keyword", keyword: string): void;
    (e: "update-keywords", keywords: MultilingualContent[]): void;
    (e: "update-description", description: MultilingualContent[]): void;
    (e: "update-remark", remark: MultilingualContent[]): void;
    (e: "identifiers-updated"): void;
}>();
</script>
