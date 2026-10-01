<template>
    <div
        class="group w-full px-3 py-3 cursor-pointer hover:bg-gray-50"
        :class="isSelected ? 'bg-purple-50' : 'bg-white'"
        role="button"
        tabindex="0"
        @click="$emit('open')"
        @keyup.enter="$emit('open')"
    >
        <div class="flex gap-2 items-start">
            <div v-if="showSelect" class="flex-shrink-0" @click.stop>
                <v-checkbox
                    :model-value="selectedPublications"
                    :value="item"
                    class="table-checkbox"
                    hide-details
                    density="compact"
                    @update:model-value="$emit('update:selectedPublications', $event)"
                />
            </div>
            <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                    <div class="text-gray-800 font-semibold text-sm leading-snug min-w-0">
                        <rich-title-renderer :title="getItemTitle(item)" />
                    </div>
                    <span v-if="item.year && item.year > 0" class="text-xs text-gray-600 flex-shrink-0 pt-0.5">
                        {{ item.year }}
                    </span>
                </div>
                <div class="mt-1">
                    <v-chip
                        size="small"
                        color="primary"
                        variant="flat"
                        :prepend-icon="getPublicationTypeIcon(item.type)"
                    >
                        {{ getPublicationTypeLabel(item, showPublicationConcreteType) }}
                    </v-chip>
                </div>
                <p v-if="authorsPreview" class="mt-1 text-xs text-gray-600 leading-relaxed">
                    {{ authorsPreview }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import RichTitleRenderer from "../core/RichTitleRenderer.vue";
import { getPublicationTypeIcon, getPublicationTypeLabel, splitAuthorNames, usePublicationItemDisplay } from "@/composables/usePublicationItemDisplay";

const props = withDefaults(defineProps<{
    item: DocumentPublicationIndex;
    selectedPublications: DocumentPublicationIndex[];
    showSelect?: boolean;
    showPublicationConcreteType?: boolean;
}>(), {
    showSelect: false,
    showPublicationConcreteType: false
});

defineEmits<{
    open: [];
    "update:selectedPublications": [value: DocumentPublicationIndex[]];
}>();

const { getItemTitle } = usePublicationItemDisplay();

const isSelected = computed(() => props.selectedPublications.some((publication) => publication.id === props.item.id));

const authorsPreview = computed(() => {
    const authors = splitAuthorNames(props.item);
    if (!authors.length) {
        return "";
    }

    const visible = authors.slice(0, 3).join(", ");
    if (authors.length <= 3) {
        return visible;
    }

    return `${visible} +${authors.length - 3}`;
});
</script>
