<template>
    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header class="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div
                class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                :class="iconClass">
                <span class="mdi text-lg" :class="icon" aria-hidden="true" />
            </div>
            <h3 class="min-w-0 flex-1 text-sm font-semibold text-slate-800">
                {{ title }}
                <span
                    v-if="count !== undefined"
                    class="font-medium text-slate-500">
                    ({{ count }})
                </span>
            </h3>
            <div v-if="$slots.action" class="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                <slot name="action" />
            </div>
        </header>
        <div :class="padded ? 'px-4 py-4' : undefined">
            <slot />
        </div>
    </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    title: string;
    icon: string;
    iconClass?: string;
    count?: number;
    padded?: boolean;
}>(), {
    iconClass: "bg-slate-100 text-slate-600",
    padded: false,
    count: undefined,
});

defineOptions({
    name: "LandingSectionCard",
});
</script>
