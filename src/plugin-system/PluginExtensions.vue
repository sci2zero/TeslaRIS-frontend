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
            :is="item.component"
            v-for="item in items"
            v-bind="componentProps"
            :key="item.id" />
    </slot>
</template>
