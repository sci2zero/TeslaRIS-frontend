<template>
    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <header v-if="title || description" class="mb-5 flex items-start gap-3">
            <div
                v-if="icon"
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"
            >
                <v-icon :icon="icon" size="20" />
            </div>
            <div class="min-w-0">
                <h2 class="!m-0 !text-lg !font-semibold !leading-6 text-slate-900">
                    {{ title }}
                </h2>
                <p v-if="description" class="mt-0.5 text-sm text-slate-500">
                    {{ description }}
                </p>
            </div>
        </header>
        <div class="flex flex-col gap-4">
            <slot />
        </div>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    title?: string;
    description?: string;
    icon?: string;
}>();
</script>
