<template>
    <div class="flex items-center justify-start space-x-3">
        <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shadow-md shrink-0"
            :class="toneClass"
        >
            <span v-if="abbrev" class="text-white text-xs font-bold">{{ abbrev }}</span>
            <span v-else class="mdi text-white text-sm" :class="icon"></span>
        </div>
        <div class="flex flex-col min-w-0 text-left">
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">{{ label }}</span>
            <span class="text-sm text-slate-800 font-medium break-words">
                <slot />
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
    label: string;
    icon?: string;
    abbrev?: string;
    tone?: "slate" | "emerald" | "amber" | "blue" | "indigo" | "violet";
}>(), {
    icon: "mdi-information-outline",
    abbrev: "",
    tone: "slate",
});

const toneClass = computed(() => ({
    slate: "bg-slate-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
    blue: "bg-blue-600",
    indigo: "bg-indigo-600",
    violet: "bg-violet-600",
}[props.tone]));
</script>
