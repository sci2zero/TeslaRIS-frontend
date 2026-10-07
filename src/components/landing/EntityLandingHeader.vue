<template>
    <div class="relative mb-8">
        <slot name="modals" />

        <v-menu
            v-if="canEdit"
            location="bottom end"
        >
            <template #activator="{ props: menuProps }">
                <UiButton
                    variant="outline"
                    size="icon-sm"
                    class="absolute top-0 right-0 z-20 sm:hidden"
                    v-bind="menuProps"
                    :aria-label="$t('moreActionsLabel')"
                >
                    <span class="mdi mdi-dots-horizontal text-lg" />
                </UiButton>
            </template>
            <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                <v-list-item
                    prepend-icon="mdi-pencil-outline"
                    :title="editLabel || $t('editActionLabel')"
                    @click="$emit('edit')"
                />
                <ExtraEditMenu />
            </v-list>
        </v-menu>

        <div class="flex flex-col sm:flex-row items-center sm:items-start w-full">
            <div class="flex-shrink-0 sm:mb-0 sm:mr-12">
                <div class="relative">
                    <div
                        class="relative overflow-hidden border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex items-center justify-center"
                        :class="[
                            visualShape === 'circle'
                                ? 'rounded-full w-32 h-32 sm:size-48 sm:size-64'
                                : $slots.visual
                                    ? 'rounded-2xl w-32 h-32 sm:size-48 sm:size-64'
                                    : 'rounded-2xl w-[7.25rem] h-[10.5rem] sm:w-40 sm:h-[14.75rem] sm:w-48 sm:h-[17.75rem]',
                            $slots.visual ? 'bg-slate-50' : 'book-first-page',
                        ]"
                    >
                        <slot v-if="$slots.visual" name="visual" />
                        <div
                            v-else
                            class="relative flex h-full w-full flex-col items-center px-3 py-4 text-center sm:px-4 sm:py-5 sm:px-5 sm:py-6"
                        >
                            <svg
                                class="pointer-events-none absolute inset-0 h-full w-full"
                                viewBox="0 0 192 280"
                                preserveAspectRatio="xMidYMid slice"
                                aria-hidden="true"
                            >
                                <polygon
                                    v-for="(polygon, index) in coverPattern.polygons"
                                    :key="index"
                                    :points="polygon.points"
                                    :fill="polygon.fill"
                                    :opacity="polygon.opacity"
                                />
                                <line
                                    v-for="(line, index) in coverPattern.lines"
                                    :key="`line-${index}`"
                                    :x1="line.x"
                                    :y1="line.y1"
                                    :x2="line.x"
                                    :y2="line.y2"
                                    :stroke="line.stroke"
                                    stroke-width="0.75"
                                    :opacity="line.opacity"
                                />
                            </svg>
                            <div class="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center">
                                <v-icon class="book-first-page__icon text-indigo-400">
                                    {{ icon }}
                                </v-icon>
                                <p
                                    v-if="entityLabel"
                                    class="mt-2 max-w-full text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-slate-600 line-clamp-3 sm:mt-3 sm:text-xs sm:text-sm"
                                >
                                    {{ entityLabel }}
                                </p>
                            </div>
                            <div
                                v-if="badge || year"
                                class="relative z-10 mt-2 flex w-full flex-col items-center"
                            >
                                <p
                                    v-if="badge"
                                    class="max-w-full px-1 text-[9px] font-medium leading-tight text-indigo-500 line-clamp-2 sm:text-[11px]"
                                >
                                    {{ badge }}
                                </p>
                                <template v-if="year">
                                    <div class="mt-1.5 h-px w-8 bg-indigo-200 sm:mt-2 sm:w-10" />
                                    <p class="mt-1 text-xs tabular-nums text-slate-600 sm:text-sm sm:text-base">
                                        {{ year }}
                                    </p>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="badge && $slots.visual"
                        class="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 max-w-[85%] bg-emerald-600 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg border-2 border-white truncate pointer-events-none"
                    >
                        {{ badge }}
                    </div>
                </div>
            </div>

            <div class="flex-1 min-w-0 w-full text-center sm:text-left">
                <div class="flex items-start justify-center sm:justify-start w-full gap-3 mb-3">
                    <h1 class="text-3xl sm:text-4xl sm:text-5xl font-serif font-bold text-slate-800 leading-tight tracking-tight min-w-0 flex-1 mt-1">
                        <v-skeleton-loader
                            :loading="loading"
                            type="heading"
                            class="bg-transparent"
                        >
                            <slot name="title">
                                {{ title }}
                            </slot>
                        </v-skeleton-loader>
                    </h1>
                    <div
                        v-if="canEdit"
                        class="hidden sm:block shrink-0 mt-1"
                    >
                        <UiButton
                            v-if="!hasEditMenu"
                            variant="outline"
                            size="sm"
                            @click="$emit('edit')"
                        >
                            <span class="mdi mdi-pencil-outline text-lg" />
                            {{ $t('editActionLabel') }}
                        </UiButton>
                        <v-menu
                            v-else
                            location="bottom end"
                        >
                            <template #activator="{ props: menuProps }">
                                <UiButton
                                    variant="outline"
                                    size="sm"
                                    v-bind="menuProps"
                                >
                                    <span class="mdi mdi-pencil-outline text-lg" />
                                    {{ $t('editActionLabel') }}
                                    <span class="mdi mdi-chevron-down" />
                                </UiButton>
                            </template>
                            <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                                <v-list-item
                                    prepend-icon="mdi-pencil-outline"
                                    :title="editLabel || $t('editActionLabel')"
                                    @click="$emit('edit')"
                                />
                                <ExtraEditMenu />
                            </v-list>
                        </v-menu>
                    </div>
                </div>

                <slot name="subtitle">
                    <p
                        v-if="subtitle"
                        class="text-lg sm:text-xl text-slate-600 mb-2"
                    >
                        {{ subtitle }}
                    </p>
                </slot>
                <p
                    v-if="entityLabel"
                    class="text-sm text-slate-500 font-medium mb-6"
                >
                    {{ entityLabel }}
                </p>

                <div v-if="$slots.affiliation" class="mb-6 sm:mb-8">
                    <slot name="affiliation" />
                </div>

                <div v-if="$slots.meta" class="mb-6 flex justify-center sm:justify-start">
                    <div class="space-y-3">
                        <slot name="meta" />
                    </div>
                </div>

                <slot name="status" />

                <div
                    v-if="entityId && entityType"
                    class="my-5 flex justify-center sm:justify-start"
                >
                    <data-quality-remarks-dialog
                        :entity-type="entityType"
                        :entity-id="entityId"
                        prominent
                    />
                </div>

                <div
                    v-if="$slots.actions"
                    class="flex flex-col sm:flex-row flex-wrap gap-3 justify-center sm:justify-start w-full"
                >
                    <slot name="actions" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, useSlots } from "vue";
import DataQualityRemarksDialog from "@/components/core/revisions/DataQualityRemarksDialog.vue";
import { UiButton } from "@/components/ui/button";

const slots = useSlots();
const hasEditMenu = computed(() => typeof slots["edit-menu"] === "function");
const ExtraEditMenu = defineComponent({
    name: "ExtraEditMenu",
    setup() {
        return () => slots["edit-menu"]?.() ?? [];
    }
});

const props = withDefaults(defineProps<{
    title?: string;
    subtitle?: string | null;
    entityLabel?: string;
    badge?: string;
    icon?: string;
    year?: string | number | null;
    canEdit?: boolean;
    loading?: boolean;
    editLabel?: string;
    entityType?: string;
    entityId?: number;
    visualShape?: "rounded" | "circle";
}>(), {
    title: "",
    subtitle: "",
    entityLabel: "",
    badge: "",
    icon: "mdi-file-document-outline",
    year: "",
    canEdit: false,
    loading: false,
    editLabel: "",
    visualShape: "rounded",
});

defineEmits<{
    edit: [];
}>();

const COVER_PALETTE = ["#94a3b8", "#818cf8", "#6366f1", "#a5b4fc", "#64748b", "#c7d2fe", "#cbd5e1"];

function hashSeed(id: number | undefined, type: string | undefined): number {
    let seed = Number(id ?? 1) >>> 0;
    const typeStr = String(type ?? "");

    for (let index = 0; index < typeStr.length; index++) {
        seed = Math.imul(seed ^ typeStr.charCodeAt(index), 2654435761) >>> 0;
    }

    return seed || 1;
}

function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function mix(min: number, max: number, value: number) {
    return min + (max - min) * value;
}

const coverPattern = computed(() => {
    const random = mulberry32(hashSeed(props.entityId, props.entityType));
    const pickColor = () => COVER_PALETTE[Math.floor(random() * COVER_PALETTE.length)];
    const point = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

    return {
        polygons: [
            {
                points: [
                    point(0, mix(168, 224, random())),
                    point(mix(86, 138, random()), 280),
                    point(0, 280)
                ].join(" "),
                fill: pickColor(),
                opacity: mix(0.1, 0.22, random())
            },
            {
                points: [
                    point(mix(20, 76, random()), 280),
                    point(192, mix(136, 192, random())),
                    point(192, 280)
                ].join(" "),
                fill: pickColor(),
                opacity: mix(0.08, 0.18, random())
            },
            {
                points: [
                    point(mix(84, 132, random()), 280),
                    point(192, mix(186, 232, random())),
                    point(192, 280)
                ].join(" "),
                fill: pickColor(),
                opacity: mix(0.07, 0.16, random())
            },
            {
                points: [
                    point(192, 0),
                    point(192, mix(44, 98, random())),
                    point(mix(76, 142, random()), 0)
                ].join(" "),
                fill: pickColor(),
                opacity: mix(0.16, 0.34, random())
            }
        ],
        lines: [
            {
                x: mix(14, 22, random()),
                y1: mix(18, 40, random()),
                y2: mix(238, 260, random()),
                stroke: pickColor(),
                opacity: mix(0.1, 0.3, random())
            },
            {
                x: mix(22, 32, random()),
                y1: mix(34, 58, random()),
                y2: mix(216, 246, random()),
                stroke: pickColor(),
                opacity: mix(0.2, 0.3, random())
            }
        ]
    };
});
</script>

<style scoped>
.font-serif {
    font-family: "Georgia", "Times New Roman", serif;
}

.book-first-page {
    background-color: #f8fafc;
}

.book-first-page__icon {
    font-size: 1.85rem !important;
}

@media (min-width: 640px) {
    .book-first-page__icon {
        font-size: 2.5rem !important;
    }
}

@media (min-width: 1024px) {
    .book-first-page__icon {
        font-size: 2.85rem !important;
    }
}
</style>
