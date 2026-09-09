<template>
    <div class="mt-4 space-y-6">
        <div v-if="$slots.details" class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span class="mdi mdi-book-open-page-variant-outline mr-2 text-blue-600"></span>
                {{ $t("basicInfoLabel") }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <slot name="details"></slot>
            </div>
        </div>

        <div v-if="document" class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span class="mdi mdi-identifier mr-2 text-indigo-600"></span>
                {{ $t("identifiersLabel") }}
            </h3>
            <v-row>
                <document-common-fields-display
                    :document="document"
                    :cols="12"
                    :can-edit="canEdit"
                    :containing-entity-type="containingEntityType"
                    :concrete-entity-type="concreteEntityType"
                    :document-identifiers="documentIdentifiers"
                    @identifiers-updated="$emit('identifiers-updated')"
                />
            </v-row>
        </div>

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
