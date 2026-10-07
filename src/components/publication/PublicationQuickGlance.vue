<template>
    <v-bottom-sheet
        v-model="open"
        inset
    >
        <v-card v-if="item" class="rounded-t-2xl max-h-[90vh] flex flex-col">
            <div class="flex justify-center pt-2 pb-1">
                <div class="w-10 h-1 rounded-full bg-slate-300" />
            </div>
            <v-card-title class="px-4 pt-1 pb-2 flex items-start gap-2">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <v-icon color="primary" size="20">
                        {{ getPublicationTypeIcon(item.type) }}
                    </v-icon>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                        <div class="text-base font-semibold leading-snug text-slate-800">
                            <rich-title-renderer :title="getItemTitle(item)" />
                        </div>
                        <span v-if="item.year && item.year > 0" class="text-sm text-slate-500 font-medium flex-shrink-0 tabular-nums">
                            {{ item.year }}
                        </span>
                    </div>
                    <v-chip
                        class="mt-2"
                        size="small"
                        color="primary"
                        variant="tonal"
                        :prepend-icon="getPublicationTypeIcon(item.type)"
                    >
                        {{ getPublicationTypeLabel(item, showPublicationConcreteType) }}
                    </v-chip>
                </div>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    class="flex-shrink-0"
                    @click="open = false"
                />
            </v-card-title>

            <v-card-text class="px-4 pb-4 overflow-y-auto">
                <div v-if="splitAuthorNames(item).length" class="mb-4">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                        {{ $t("authorsLabel") }}
                    </p>
                    <publication-author-list :item="item" :max-visible="0" />
                </div>

                <div v-if="description" class="mb-4">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                        {{ $t("descriptionLabel") }}
                    </p>
                    <p class="text-sm text-slate-700 leading-relaxed line-clamp-6">
                        {{ description }}
                    </p>
                </div>

                <div v-if="item.doi" class="mb-4 flex items-center gap-2">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                        DOI
                    </p>
                    <identifier-menu :identifier="item.doi" type="doi" />
                </div>

                <div class="flex flex-wrap items-center gap-2 mb-4">
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
                        v-else
                        :document-id="(item.databaseId as number)"
                        :show-thesis-sections="item.type === 'THESIS'"
                        :is-thesis-section="item.type === 'THESIS'"
                        hide-empty-sections
                        :persistent="false"
                        :is-list-item="false"
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
                    <div v-if="isCommission" class="flex items-center gap-1 text-sm text-slate-600">
                        <v-icon
                            :icon="item.assessedBy?.includes(loggedInCommissionId as number) ? 'mdi-check' : 'mdi-close'"
                            size="18"
                        />
                        {{ $t("assessedByMeLabel") }}
                    </div>
                </div>

                <localized-link :to="landingPath" class="block">
                    <span class="inline-flex w-full items-center justify-center gap-2 font-medium rounded-lg px-4 py-2.5 text-sm bg-slate-800 text-white shadow-md hover:bg-slate-700">
                        {{ $t("openPublicationPageLabel") }}
                    </span>
                </localized-link>
            </v-card-text>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import RichTitleRenderer from "../core/RichTitleRenderer.vue";
import IdentifierMenu from "../core/IdentifierMenu.vue";
import LocalizedLink from "../localization/LocalizedLink.vue";
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
