<template>
    <div
        class="flex min-w-0 flex-1 gap-3"
        :class="$slots.default ? 'items-start' : 'items-center'">
        <div class="shrink-0">
            <slot name="icon">
                <span class="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <v-icon :icon="icon" />
                </span>
            </slot>
        </div>
        <div class="min-w-0 flex-1">
            <localized-link v-if="to" :to="to" class="text-sm font-semibold text-slate-800 break-words">
                {{ title }}
            </localized-link>
            <span v-else class="text-sm font-semibold text-slate-800 break-words">{{ title }}</span>
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
withDefaults(defineProps<{
    title: string;
    to?: string;
    icon?: string;
}>(), { to: undefined, icon: "mdi-file-document-outline" });
</script>
