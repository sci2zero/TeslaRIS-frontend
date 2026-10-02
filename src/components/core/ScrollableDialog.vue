<template>
    <v-dialog
        :model-value="modelValue"
        class="scrollable-dialog"
        :max-width="maxWidth"
        :persistent="persistent"
        :width="width"
        @update:model-value="emit('update:modelValue', $event)"
        @keydown.esc="emit('escape', $event)"
        @click:outside="emit('click-outside', $event)"
    >
        <template v-if="$slots.activator" #activator="scope">
            <slot name="activator" v-bind="scope" />
        </template>

        <div
            ref="panelRef"
            class="flex max-h-[calc(100dvh-3rem)] min-h-0 w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
            v-bind="attrs"
        >
            <div v-if="$slots.header" class="shrink-0 border-b border-slate-200">
                <slot name="header" />
            </div>

            <div
                ref="bodyRef"
                class="min-h-0 overflow-y-auto"
                @scroll="updateScrollState"
            >
                <div ref="contentRef" :class="bodyClass">
                    <slot />
                </div>
            </div>

            <div
                v-if="$slots.footer"
                class="scrollable-dialog-footer shrink-0 border-t border-slate-200"
                :class="{ 'has-more': canScrollDown }"
            >
                <slot name="footer" />
            </div>
        </div>
    </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useAttrs, watch } from "vue";

defineOptions({
    name: "ScrollableDialog",
    inheritAttrs: false,
});

const props = withDefaults(defineProps<{
    modelValue: boolean;
    maxWidth?: string | number;
    persistent?: boolean;
    width?: string | number;
    bodyClass?: string;
}>(), {
    maxWidth: 700,
    persistent: false,
    width: undefined,
    bodyClass: "",
});

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    escape: [event: KeyboardEvent];
    "click-outside": [event: Event];
}>();

const attrs = useAttrs();
const panelRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const canScrollDown = ref(false);
let resizeObserver: ResizeObserver | null = null;

const updateScrollState = () => {
    const el = bodyRef.value;
    if (!el) {
        canScrollDown.value = false;
        return;
    }
    canScrollDown.value = el.scrollHeight - el.scrollTop - el.clientHeight > 8;
};

const observeScrollBody = () => {
    resizeObserver?.disconnect();
    const body = bodyRef.value;
    const content = contentRef.value;
    if (!body) {
        return;
    }
    updateScrollState();
    if (typeof ResizeObserver === "undefined") {
        return;
    }
    resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(body);
    if (content) {
        resizeObserver.observe(content);
    }
};

const refreshScrollState = () => {
    nextTick(() => {
        observeScrollBody();
        requestAnimationFrame(updateScrollState);
    });
};

watch(bodyRef, (el) => {
    if (!el) {
        canScrollDown.value = false;
        resizeObserver?.disconnect();
        resizeObserver = null;
        return;
    }
    refreshScrollState();
});

watch(() => props.modelValue, (open) => {
    if (open) {
        refreshScrollState();
    }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

defineExpose({
    getPanel: () => panelRef.value,
});
</script>

<style scoped>
.scrollable-dialog :deep(.v-overlay__content) {
    overflow: hidden;
    max-height: calc(100dvh - 3rem);
}

.scrollable-dialog-footer {
    position: relative;
}

.scrollable-dialog-footer::before {
    content: "";
    position: absolute;
    right: 0;
    bottom: 100%;
    left: 0;
    height: 1.75rem;
    pointer-events: none;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0));
    opacity: 0;
    transition: opacity 0.15s ease;
}

.scrollable-dialog-footer.has-more {
    box-shadow: 0 -8px 14px -6px rgba(15, 23, 42, 0.35);
}

.scrollable-dialog-footer.has-more::before {
    opacity: 1;
}
</style>
