<template>
    <article
        class="flex w-full items-start gap-2 px-3 py-3 cursor-pointer hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
        :role="to ? 'link' : 'button'"
        tabindex="0"
        @click="navigate"
        @keydown.enter.self.prevent="openPage"
        @keydown.space.self.prevent="!to && openPage()"
    >
        <div class="min-w-0 flex-1">
            <slot />
        </div>
        <div class="shrink-0 my-auto">
            <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                class="shrink-0 margin-y-auto"
                :aria-label="$t('moreActionsLabel')"
                :title="$t('moreActionsLabel')"
                aria-haspopup="dialog"
                @click.stop="$emit('preview')"
                @keydown.stop
            />
        </div>
    </article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps<{ to?: string }>();
const emit = defineEmits<{ preview: [] }>();
const { locale } = useI18n();
const router = useRouter();

const openPage = () => {
    if (props.to) {
        return router.push(`/${locale.value}/${props.to.replace(/^\/+/, '')}`);
    }
    emit('preview');
};
const navigate = (event: MouseEvent) => {
    // Nested links, selection controls and menus keep their own interactions.
    if (event.defaultPrevented) return;
    const interactiveTarget = event.target instanceof Element
        ? event.target.closest('a, button, input, select, textarea, [role="button"], [role="checkbox"], .v-selection-control')
        : null;
    if (interactiveTarget && interactiveTarget !== event.currentTarget) return;
    openPage();
};
</script>
