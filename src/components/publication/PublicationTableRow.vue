<template>
    <tr class="handle">
        <td v-if="showSelect" class="px-2!">
            <v-checkbox
                :model-value="selectedPublications"
                :value="item"
                class="table-checkbox"
                hide-details
                @update:model-value="$emit('update:selectedPublications', $event)"
            />
        </td>
        <td class="py-2! min-w-0">
            <div class="flex gap-2 min-w-0">
                <localized-link :to="landingPath" class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors flex-shrink-0">
                    <v-icon color="primary" size="20">
                        {{ getPublicationTypeIcon(item.type) }}
                    </v-icon>
                </localized-link>
                <div class="min-w-0">
                    <div class="text-gray-800! hover:text-blue-900! font-semibold text-base min-w-0">
                        <localized-link :to="landingPath">
                            <rich-title-renderer :title="getItemTitle(item)" inline />
                        </localized-link><span v-if="item.year && item.year > 0" class="whitespace-nowrap">, <span class="text-xs text-gray-600 font-normal">{{ item.year }}</span></span>
                    </div>
                    <publication-author-list :item="item" />
                </div>
            </div>
        </td>
        <td>
            <v-chip size="small" color="primary" variant="flat" :prepend-icon="getPublicationTypeIcon(item.type)">
                {{ getPublicationTypeLabel(item, showPublicationConcreteType) }}
            </v-chip>
        </td>
        <td>
            <identifier-menu v-if="item.doi" :identifier="item.doi" type="doi" />
        </td>
        <td v-if="showDocumentDownload">
            <v-menu
                v-if="richResultsView"
                :close-on-content-click="true"
                location="bottom"
            >
                <template #activator="{ props }">
                    <div class="edit-pen">
                        <v-btn
                            v-bind="props"
                            compact>
                            ...
                        </v-btn>
                    </div>
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
            <div
                v-else
                class="d-flex flex-row justify-center">
                <publication-file-download-modal
                    :document-id="(item.databaseId as number)"
                    :show-thesis-sections="item.type === 'THESIS'"
                    :is-thesis-section="item.type === 'THESIS'"
                    hide-empty-sections
                    :persistent="false"
                    :is-list-item="false"
                    :contains-files="item.containsFiles"
                />
            </div>
        </td>
        <td>
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
        </td>
        <td v-if="isCommission">
            <v-icon v-if="item.assessedBy?.includes(loggedInCommissionId as number)" icon="mdi-check" />
            <v-icon v-else icon="mdi-close" />
        </td>
    </tr>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import LocalizedLink from "../localization/LocalizedLink.vue";
import RichTitleRenderer from "../core/RichTitleRenderer.vue";
import IdentifierMenu from "../core/IdentifierMenu.vue";
import PublicationReferenceFormats from "./PublicationReferenceFormats.vue";
import PublicationFileDownloadModal from "./PublicationFileDownloadModal.vue";
import PublicationAuthorList from "./PublicationAuthorList.vue";
import PublicationItemActions from "./PublicationItemActions.vue";
import { getDocumentLandingPageBasePath } from "@/utils/PathResolutionUtil";
import { getPublicationTypeIcon, getPublicationTypeLabel, usePublicationItemDisplay } from "@/composables/usePublicationItemDisplay";

const props = defineProps<{
    item: DocumentPublicationIndex;
    selectedPublications: DocumentPublicationIndex[];
    showSelect?: boolean;
    showPublicationConcreteType?: boolean;
    richResultsView?: boolean;
    validationView?: boolean;
    inClaimer?: boolean;
    showClassification?: boolean;
    isCommission?: boolean;
    loggedInCommissionId?: number | null;
    showDocumentDownload?: boolean;
}>();

defineEmits<{
    "update:selectedPublications": [value: DocumentPublicationIndex[]];
    claim: [documentId: number];
    declineClaim: [documentId: number];
    classified: [item: DocumentPublicationIndex];
    refresh: [];
    validate: [documentId: number, metadata: boolean];
}>();

const { getItemTitle } = usePublicationItemDisplay();

const landingPath = computed(() => getDocumentLandingPageBasePath(props.item.type) + props.item.databaseId);
</script>
