<template>
    <div>
        <label class="block text-sm font-medium text-gray-700">{{ label }}</label>
        <p class="mt-1 text-sm text-gray-900">
            <slot>{{ value || "—" }}</slot>
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string;
    value?: string | number | null;
}>();
</script>
