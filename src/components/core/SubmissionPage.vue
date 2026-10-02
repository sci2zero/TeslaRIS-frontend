<template>
    <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header class="mb-6">
            <h1 class="text-3xl font-bold tracking-tight text-slate-800">
                {{ title }}
            </h1>
        </header>

        <section
            v-if="!plain"
            class="rounded-xl border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8"
        >
            <slot />
            <footer class="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6">
                <slot name="actions" />
            </footer>
        </section>
        <template v-else>
            <div class="flex flex-col gap-6">
                <slot />
            </div>
            <footer class="mt-6 flex flex-wrap items-center justify-end gap-3">
                <slot name="actions" />
            </footer>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "SubmissionPage",
    props: {
        title: {
            type: String,
            required: true,
        },
        plain: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
