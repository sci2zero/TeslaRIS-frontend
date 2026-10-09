<template>
    <dl class="entity-detail-field">
        <dt>{{ label }}</dt>
        <dd><slot /></dd>
    </dl>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<style scoped>
.entity-detail-field { min-width: 0; margin: 0; }
.entity-detail-field dt {
    margin-bottom: 6px;
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.5;
}
.entity-detail-field dd {
    margin: 0;
    color: #334155;
    font-size: 0.875rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
}
</style>
