<template>
    <div class="text-left">
        <div v-if="!citation" class="space-y-2" aria-busy="true">
            <div
                v-for="index in 5"
                :key="index"
                class="h-20 rounded-lg bg-slate-100 animate-pulse"
            />
        </div>

        <p
            v-else-if="!availableStyles.length"
            class="text-sm text-slate-500"
        >
            {{ $t("citationsUnavailableLabel") }}
        </p>

        <div
            v-else
            class="space-y-3"
        >
            <article
                v-for="style in availableStyles"
                :key="style.key"
                class="rounded-xl border border-slate-200 overflow-hidden"
            >
                <div class="flex items-center gap-2 min-h-8 px-3 bg-slate-50">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        {{ style.label }}
                    </span>
                    <UiButton
                        variant="ghost"
                        size="icon-sm"
                        class="ml-auto shrink-0 size-7 text-slate-500 hover:text-slate-800"
                        :aria-label="copiedKey === style.key ? $t('copiedLabel') : $t('copyCitationLabel')"
                        :title="copiedKey === style.key ? $t('copiedLabel') : $t('copyCitationLabel')"
                        @click="copyAndSelect(style.key)"
                    >
                        <span
                            class="mdi text-base"
                            :class="copiedKey === style.key ? 'mdi-check' : 'mdi-content-copy'"
                            aria-hidden="true"
                        />
                    </UiButton>
                </div>

                <div
                    :ref="(el) => setPreview(style.key, el)"
                    class="citation-preview px-3 py-2.5 text-sm leading-relaxed text-slate-800 bg-white"
                    tabindex="0"
                    @click="selectText(style.key)"
                    @keydown.enter.prevent="selectText(style.key)"
                >
                    {{ citation[style.key] }}
                </div>
            </article>
        </div>

        <toast v-model="snackbar" :message="$t('copiedLabel')" />
    </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { CitationResponse } from "@/models/PublicationModel";
import Toast from "../core/Toast.vue";
import { UiButton } from "@/components/ui/button";

defineOptions({
    name: "CitationFormats",
});

const props = defineProps<{
    citation?: CitationResponse;
}>();

const { t } = useI18n();

const snackbar = ref(false);
const copiedKey = ref<keyof CitationResponse | null>(null);
const previewEls = ref<Partial<Record<keyof CitationResponse, HTMLElement>>>({});

let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

const styles = computed(() => [
    { key: "apa" as const, label: "APA" },
    { key: "mla" as const, label: "MLA" },
    { key: "chicago" as const, label: "Chicago" },
    { key: "harvard" as const, label: "Harvard" },
    { key: "vancouver" as const, label: "Vancouver" },
]);

const availableStyles = computed(() =>
    styles.value.filter((style) => Boolean(props.citation?.[style.key]?.trim()))
);

const setPreview = (key: keyof CitationResponse, el: unknown) => {
    if (el instanceof HTMLElement) {
        previewEls.value[key] = el;
        return;
    }

    delete previewEls.value[key];
};

const highlightPreview = (key: keyof CitationResponse) => {
    const target = previewEls.value[key];
    if (!target) {
        return;
    }

    const range = document.createRange();
    range.selectNodeContents(target);

    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

const selectText = (key: keyof CitationResponse) => {
    highlightPreview(key);
};

const copyAndSelect = async (key: keyof CitationResponse) => {
    const text = props.citation?.[key];
    if (!text) {
        return;
    }

    highlightPreview(key);

    try {
        await navigator.clipboard.writeText(text);
        copiedKey.value = key;
        snackbar.value = true;

        if (copiedTimeout) {
            clearTimeout(copiedTimeout);
        }

        copiedTimeout = setTimeout(() => {
            copiedKey.value = null;
        }, 2000);
    } catch {
        highlightPreview(key);
    }
};

onUnmounted(() => {
    if (copiedTimeout) {
        clearTimeout(copiedTimeout);
    }
});
</script>

<style scoped>
.citation-preview {
    font-family: "Georgia", "Times New Roman", serif;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    cursor: text;
    user-select: text;
}

.citation-preview:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px rgb(148 163 184 / 0.7);
}
</style>
