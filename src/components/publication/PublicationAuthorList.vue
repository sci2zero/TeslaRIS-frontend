<template>
    <div v-if="authors.length" :class="compact ? 'text-sm text-slate-600' : 'mt-1 ml-1 text-sm text-gray-600'">
        <div v-for="(author, index) in displayedAuthors" :key="`${author}-${index}`">
            <localized-link
                v-if="item.authorIds[index] !== -1"
                :to="'persons/' + item.authorIds[index]"
                class="flex items-center gap-1"
                @click.stop
            >
                <v-icon size="14" class="text-gray-500">
                    mdi-account
                </v-icon>
                {{ author }}
            </localized-link>
            <span v-else class="flex items-center gap-1">
                <v-icon size="14" class="text-gray-500">mdi-account-outline</v-icon>
                {{ author }}
            </span>
        </div>
        <v-btn
            v-if="shouldShowMore"
            variant="text"
            size="x-small"
            color="primary"
            class="mt-1"
            @click.stop="expanded = !expanded"
        >
            {{ moreText }}
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import LocalizedLink from "../localization/LocalizedLink.vue";
import { splitAuthorNames } from "@/composables/usePublicationItemDisplay";

const props = withDefaults(defineProps<{
    item: DocumentPublicationIndex;
    maxVisible?: number;
    compact?: boolean;
}>(), {
    maxVisible: 4,
    compact: false
});

const i18n = useI18n();
const expanded = ref(false);

const authors = computed(() => splitAuthorNames(props.item));

const displayedAuthors = computed(() => {
    if (props.maxVisible <= 0 || expanded.value || authors.value.length <= props.maxVisible) {
        return authors.value;
    }

    return authors.value.slice(0, props.maxVisible);
});

const shouldShowMore = computed(() => props.maxVisible > 0 && authors.value.length > props.maxVisible);

const moreText = computed(() => {
    if (expanded.value) {
        return i18n.t("showLessLabel");
    }

    return i18n.t("showMoreAuthorsLabel", { count: authors.value.length - props.maxVisible });
});
</script>
