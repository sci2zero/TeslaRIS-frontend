<script setup lang="ts">
import { computed } from "vue";
import { getExtensions } from "./registry";

const props = defineProps<{
    name: string;
    componentProps?: Record<string, unknown>;
}>();

const items = computed(() => getExtensions(props.name));
</script>

<template>
    <slot :items="items">
        <component
            v-for="item in items"
            :is="item.component"
            v-bind="componentProps"
            :key="item.id" />
    </slot>
</template>
