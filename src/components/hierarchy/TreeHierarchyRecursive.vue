<template>
    <li v-for="node in presetNodeData" :key="node.id" class="research-area-node">
        <div class="research-area-content">
            <h4>{{ returnCurrentLocaleContent(node.name) }}</h4>
            <p v-if="returnCurrentLocaleContent(node.description)">
                {{ returnCurrentLocaleContent(node.description) }}
            </p>
        </div>
        <ul v-if="node.children?.length" class="research-area-children">
            <tree-hierarchy-recursive :preset-node-data="node.children" />
        </ul>
    </li>
</template>

<script setup lang="ts">
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';

defineProps<{
    presetNodeData: any[];
}>();
</script>

<style scoped>
.research-area-node {
    position: relative;
    min-width: 0;
    list-style: none;
}

.research-area-content {
    position: relative;
    padding: 0.375rem 0 0.375rem 1.25rem;
    overflow-wrap: anywhere;
}

.research-area-content::before {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0.8125rem;
    left: 0.1875rem;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    background: #0d9488;
}

.research-area-content h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.5rem;
}

.research-area-content p {
    margin: 0.125rem 0 0;
    color: #64748b;
    font-size: 0.875rem;
    line-height: 1.375rem;
}

.research-area-children {
    margin: 0 0 0 0.5rem;
    padding: 0;
    list-style: none;
}

.research-area-children > .research-area-node {
    padding-left: 1rem;
}

.research-area-children > .research-area-node::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-left: 1px solid #cbd5e1;
}

.research-area-children > .research-area-node:last-child::before {
    bottom: auto;
    height: 1.125rem;
}

.research-area-children > .research-area-node::after {
    content: '';
    position: absolute;
    top: 1.125rem;
    left: 0;
    width: 1.5rem;
    border-top: 1px solid #cbd5e1;
}
</style>
