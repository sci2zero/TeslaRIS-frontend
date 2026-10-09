<template>
    <entity-details-sheet
        v-if="item"
        v-model="open"
        :title="getItemTitle(item) || ''"
        :to="landingPath"
        :open-page-label="$t('openPublicationPageLabel')"
    >
        <template #icon>
            <span class="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                <v-icon color="primary" :icon="getPublicationTypeIcon(item.type)" size="20" />
            </span>
        </template>
        <template #title>
            <rich-title-renderer :title="getItemTitle(item)" />
        </template>
        <div class="entity-details-grid">
            <entity-detail-field :label="$t('typeOfPublicationLabel')">
                {{ getPublicationTypeLabel(item, showPublicationConcreteType) }}
            </entity-detail-field>
            <entity-detail-field v-if="item.year && item.year > 0" :label="$t('yearLabel')">
                {{ item.year }}
            </entity-detail-field>
            <entity-detail-field v-if="splitAuthorNames(item).length" :label="$t('authorsLabel')" class="entity-details-full-width">
                <publication-author-list :item="item" :max-visible="0" compact />
            </entity-detail-field>
            <entity-detail-field v-if="description" :label="$t('descriptionLabel')" class="entity-details-full-width">
                <p class="whitespace-pre-line">
                    {{ description }}
                </p>
            </entity-detail-field>
            <entity-detail-field v-if="item.doi" label="DOI" class="entity-details-full-width">
                <div class="flex items-start gap-2">
                    <identifier-menu :identifier="item.doi" type="doi" class="shrink-0" />
                    <span class="min-w-0">{{ item.doi }}</span>
                </div>
            </entity-detail-field>
            <entity-detail-field v-if="isCommission" :label="$t('assessedByMeLabel')">
                <span class="inline-flex items-center gap-1">
                    <v-icon :icon="item.assessedBy?.includes(loggedInCommissionId as number) ? 'mdi-check' : 'mdi-close'" size="18" />
                    {{ item.assessedBy?.includes(loggedInCommissionId as number) ? $t('yesLabel') : $t('noLabel') }}
                </span>
            </entity-detail-field>
            <entity-detail-field
                v-if="richResultsView || item.containsFiles || inClaimer || showClassification || validationView"
                :label="$t('actions')"
                class="entity-details-full-width"
            >
                <div class="flex flex-wrap items-center gap-2">
                    <v-menu
                        v-if="richResultsView"
                        :close-on-content-click="true"
                        location="bottom"
                    >
                        <template #activator="{ props: menuProps }">
                            <v-btn
                                v-bind="menuProps"
                                size="small"
                                variant="tonal"
                                prepend-icon="mdi-dots-horizontal">
                                {{ $t("downloadableDocumentsLabel") }}
                            </v-btn>
                        </template>
                        <v-list min-width="150">
                            <publication-reference-formats
                                :document-id="(item.databaseId as number)"
                            />
                            <publication-file-download-modal
                                :document-id="(item.databaseId as number)"
                            />
                        </v-list>
                    </v-menu>
                    <publication-file-download-modal
                        v-else-if="item.containsFiles"
                        :document-id="(item.databaseId as number)"
                        :show-thesis-sections="item.type === 'THESIS'"
                        :is-thesis-section="item.type === 'THESIS'"
                        hide-empty-sections
                        :persistent="false"
                        :is-list-item="false"
                        :button-label="$t('filesForDownloadLabel')"
                        :contains-files="item.containsFiles"
                    />
                    <publication-item-actions
                        :item="item"
                        :in-claimer="inClaimer"
                        :show-classification="showClassification"
                        :validation-view="validationView"
                        @claim="$emit('claim', $event)"
                        @decline-claim="$emit('declineClaim', $event)"
                        @classified="$emit('classified', $event)"
                        @refresh="$emit('refresh')"
                        @validate="(id, metadata) => $emit('validate', id, metadata)"
                    />
                </div>
            </entity-detail-field>
        </div>
    </entity-details-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import RichTitleRenderer from "../core/RichTitleRenderer.vue";
import IdentifierMenu from "../core/IdentifierMenu.vue";
import EntityDetailsSheet from "../core/EntityDetailsSheet.vue";
import EntityDetailField from "../core/EntityDetailField.vue";
import PublicationAuthorList from "./PublicationAuthorList.vue";
import PublicationItemActions from "./PublicationItemActions.vue";
import PublicationReferenceFormats from "./PublicationReferenceFormats.vue";
import PublicationFileDownloadModal from "./PublicationFileDownloadModal.vue";
import { getDocumentLandingPageBasePath } from "@/utils/PathResolutionUtil";
import { getPublicationTypeIcon, getPublicationTypeLabel, splitAuthorNames, usePublicationItemDisplay } from "@/composables/usePublicationItemDisplay";

const props = defineProps<{
    modelValue: boolean;
    item: DocumentPublicationIndex | null;
    showPublicationConcreteType?: boolean;
    richResultsView?: boolean;
    validationView?: boolean;
    inClaimer?: boolean;
    showClassification?: boolean;
    isCommission?: boolean;
    loggedInCommissionId?: number | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    claim: [documentId: number];
    declineClaim: [documentId: number];
    classified: [item: DocumentPublicationIndex];
    refresh: [];
    validate: [documentId: number, metadata: boolean];
}>();

const { getItemTitle, getItemDescription } = usePublicationItemDisplay();

const open = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value)
});

const landingPath = computed(() => {
    if (!props.item) {
        return "";
    }

    return getDocumentLandingPageBasePath(props.item.type) + props.item.databaseId;
});

const description = computed(() => {
    if (!props.item) {
        return "";
    }

    return getItemDescription(props.item)?.trim() || "";
});
</script>
