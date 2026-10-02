<template>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup">
        <button
            v-for="option in options"
            :key="String(option.value)"
            type="button"
            role="radio"
            :aria-checked="modelValue === option.value"
            :disabled="disabled"
            class="flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :class="modelValue === option.value
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-slate-200 bg-white hover:border-slate-300'"
            @click="emit('update:modelValue', option.value)"
        >
            <span
                class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border"
                :class="modelValue === option.value ? 'border-blue-600' : 'border-slate-300'"
            >
                <span
                    v-if="modelValue === option.value"
                    class="size-2 rounded-full bg-blue-600"
                />
            </span>
            <span class="min-w-0">
                <span class="block text-sm font-semibold text-slate-800">{{ option.title }}</span>
                <span
                    v-if="option.description"
                    class="mt-0.5 block text-sm font-normal text-slate-500"
                >{{ option.description }}</span>
            </span>
        </button>
    </div>
</template>

<script setup lang="ts">
export interface ChoiceCardOption {
    value: string | number | boolean;
    title: string;
    description?: string;
}

defineProps<{
    modelValue: string | number | boolean;
    options: ChoiceCardOption[];
    disabled?: boolean;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: string | number | boolean];
}>();
</script>
