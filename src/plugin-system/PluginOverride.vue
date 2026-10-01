<script setup lang="ts">
import { computed, type Component } from "vue";
import { getOverride } from "./registry";

const props = defineProps<{
    name: string;
    fallback?: Component;
    componentProps?: Record<string, unknown>;
}>();

const component = computed(() => getOverride(props.name) ?? props.fallback);
</script>

<template>
    <component
        :is="component"
        v-if="component"
        v-bind="componentProps" />
</template>
