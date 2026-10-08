<template>
    <div class="entity-filter-panel">
        <h4 class="entity-filter-panel__title">
            {{ $t('typeOfPublicationLabel') }}
        </h4>
        <v-checkbox
            v-for="type in items"
            :key="type.value"
            :model-value="modelValue.some(selected => selected.value === type.value)"
            :label="type.title"
            density="compact"
            hide-details
            color="primary"
            @update:model-value="toggle(type, !!$event)"
        />
    </div>
</template>

<script setup lang="ts">
import type { PublicationType } from '@/models/PublicationModel';
type Option = { title: string; value: PublicationType };
const props = defineProps<{ modelValue: Option[]; items: Option[] }>();
const emit = defineEmits<{ (event: 'update:modelValue', value: Option[]): void }>();
function toggle(type: Option, selected: boolean) {
    emit('update:modelValue', selected
        ? [...props.modelValue, type]
        : props.modelValue.filter(item => item.value !== type.value));
}
</script>
