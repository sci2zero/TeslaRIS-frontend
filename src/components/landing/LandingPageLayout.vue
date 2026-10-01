<template>
    <div class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <slot name="header"></slot>
        <slot name="before-tabs"></slot>

        <tab-content-loader
            v-if="loading"
            :layout="loaderLayout"
            :tab-number="tabNumber"
            :button-header="buttonHeader"
        />

        <div
            v-show="!loading"
            ref="tabsShellRef"
            class="landing-tabs-shell"
        >
            <v-tabs
                v-model="currentTab"
                color="deep-purple-accent-4"
                align-tabs="start"
                show-arrows
                hide-slider
                class="landing-tabs landing-tabs-bar"
            >
                <slot name="tabs"></slot>
            </v-tabs>

            <button
                type="button"
                class="landing-tabs-arrow landing-tabs-arrow--prev"
                :class="{ 'landing-tabs-arrow--hidden': !canScrollPrev }"
                :tabindex="canScrollPrev ? 0 : -1"
                :aria-hidden="!canScrollPrev"
                aria-label="Previous tabs"
                @click="scrollTabs('prev')"
            >
                <v-icon icon="mdi-chevron-left" size="20" />
            </button>
            <button
                type="button"
                class="landing-tabs-arrow landing-tabs-arrow--next"
                :class="{ 'landing-tabs-arrow--hidden': !canScrollNext }"
                :tabindex="canScrollNext ? 0 : -1"
                :aria-hidden="!canScrollNext"
                aria-label="Next tabs"
                @click="scrollTabs('next')"
            >
                <v-icon icon="mdi-chevron-right" size="20" />
            </button>
        </div>

        <v-tabs-window
            v-show="!loading"
            v-model="currentTab"
            class="min-w-0"
        >
            <slot></slot>
        </v-tabs-window>

        <slot name="footer"></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import TabContentLoader from "@/components/core/TabContentLoader.vue";

const props = withDefaults(defineProps<{
    modelValue?: string;
    loading?: boolean;
    loaderLayout?: "table" | "sections" | "list";
    tabNumber?: number;
    buttonHeader?: boolean;
}>(), {
    modelValue: "",
    loading: false,
    loaderLayout: "sections",
    tabNumber: 4,
    buttonHeader: false,
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

const currentTab = computed({
    get: () => props.modelValue ?? "",
    set: (value: string) => emit("update:modelValue", value),
});

const tabsShellRef = ref<HTMLElement | null>(null);
const canScrollPrev = ref(false);
const canScrollNext = ref(false);

let tabContainer: HTMLElement | null = null;
let resizeObserver: ResizeObserver | null = null;

function getTabContainer() {
    return tabsShellRef.value?.querySelector(".v-slide-group__container") as HTMLElement | null;
}

function updateScrollState() {
    const el = tabContainer ?? getTabContainer();
    if (!el) {
        canScrollPrev.value = false;
        canScrollNext.value = false;
        return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    canScrollPrev.value = el.scrollLeft > 1;
    canScrollNext.value = maxScroll - el.scrollLeft > 1;
}

function unbindTabContainer() {
    tabContainer?.removeEventListener("scroll", updateScrollState);
    resizeObserver?.disconnect();
    resizeObserver = null;
    tabContainer = null;
}

function bindTabContainer() {
    const el = getTabContainer();
    if (!el) {
        unbindTabContainer();
        updateScrollState();
        return;
    }

    if (el !== tabContainer) {
        unbindTabContainer();
        tabContainer = el;
        tabContainer.addEventListener("scroll", updateScrollState, { passive: true });
        resizeObserver = new ResizeObserver(() => updateScrollState());
        resizeObserver.observe(tabContainer);
        const content = tabContainer.querySelector(".v-slide-group__content");
        if (content) {
            resizeObserver.observe(content);
        }
    }

    updateScrollState();
}

function scrollTabs(direction: "prev" | "next") {
    const el = tabContainer ?? getTabContainer();
    if (!el) return;

    const amount = Math.max(el.clientWidth * 0.7, 160);
    el.scrollTo({
        left: el.scrollLeft + (direction === "next" ? amount : -amount),
        behavior: "smooth",
    });
}

onMounted(async () => {
    await nextTick();
    bindTabContainer();
});

watch(() => props.loading, async (loading) => {
    if (loading) return;
    await nextTick();
    bindTabContainer();
});

watch(currentTab, async () => {
    await nextTick();
    requestAnimationFrame(updateScrollState);
});

onBeforeUnmount(() => {
    unbindTabContainer();
});
</script>

<style scoped>
.landing-tabs-shell {
    position: relative;
}

.landing-tabs-bar {
    height: auto;
    background-color: #f8fafc;
    border: 1px solid rgb(226 232 240 / 0.9);
    border-radius: 0.75rem;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.landing-tabs-bar :deep(.v-slide-group__container) {
    padding: 0.25rem;
    contain: none;
}

.landing-tabs-bar :deep(.v-slide-group__content) {
    align-items: center;
    gap: 0.125rem;
}

.landing-tabs.landing-tabs-bar :deep(.v-tab.v-btn) {
    height: 2.375rem;
    min-height: 2.375rem;
    padding-inline: 0.9rem;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    text-transform: none;
    color: #64748b;
    border-radius: 0.5rem;
    opacity: 1;
}

.landing-tabs-bar :deep(.v-tab .v-btn__overlay),
.landing-tabs-bar :deep(.v-tab .v-ripple__container) {
    display: none;
}

.landing-tabs-bar :deep(.v-tab:hover) {
    background-color: rgb(255 255 255 / 0.72);
    color: #334155;
}

.landing-tabs-bar :deep(.v-tab--selected) {
    background-color: #fff;
    color: #5e35b1;
    font-weight: 600;
    box-shadow:
        0 1px 2px rgba(15, 23, 42, 0.06),
        0 0 0 1px rgb(226 232 240 / 0.95);
}

.landing-tabs-bar :deep(.v-tab--selected:hover) {
    background-color: #fff;
    color: #5e35b1;
}

.landing-tabs-bar :deep(.v-slide-group__prev),
.landing-tabs-bar :deep(.v-slide-group__next) {
    display: none !important;
}

.landing-tabs-arrow {
    position: absolute;
    top: 1px;
    bottom: 1px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    padding: 0;
    border: 0;
    color: #64748b;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.15s ease;
}

.landing-tabs-arrow--prev {
    left: 1px;
    background: linear-gradient(to right, #f8fafc 55%, rgb(248 250 252 / 0));
    border-radius: 0.75rem 0 0 0.75rem;
}

.landing-tabs-arrow--next {
    right: 1px;
    background: linear-gradient(to left, #f8fafc 55%, rgb(248 250 252 / 0));
    border-radius: 0 0.75rem 0.75rem 0;
}

.landing-tabs-arrow--hidden {
    opacity: 0;
    pointer-events: none;
}

.landing-tabs-arrow .v-icon {
    border-radius: 0.5rem;
    background: #fff;
    box-shadow:
        0 1px 2px rgba(15, 23, 42, 0.08),
        0 0 0 1px rgb(226 232 240 / 0.95);
}

@media (max-width: 640px) {
    .landing-tabs-bar {
        border-radius: 0.625rem;
    }

    .landing-tabs-arrow--prev {
        border-radius: 0.625rem 0 0 0.625rem;
    }

    .landing-tabs-arrow--next {
        border-radius: 0 0.625rem 0.625rem 0;
    }

    .landing-tabs-bar :deep(.v-slide-group__container) {
        padding: 0.1875rem;
    }

    .landing-tabs.landing-tabs-bar :deep(.v-tab.v-btn) {
        height: 2.25rem;
        min-height: 2.25rem;
        padding-inline: 0.75rem;
        font-size: 0.8125rem;
        letter-spacing: 0;
    }
}
</style>
