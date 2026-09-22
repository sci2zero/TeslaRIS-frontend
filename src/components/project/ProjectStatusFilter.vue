<template>
    <div class="status-filter">
        <div class="filter-header">
            <span class="filter-title">{{ $t('statusLabel') }}</span>
        </div>
        <v-divider class="my-2" />
        <div class="checkbox-grid">
            <div
                v-for="status in projectStatuses"
                :key="status.value"
                class="checkbox-item"
            >
                <v-checkbox
                    :model-value="modelValue.includes(status.value)"
                    :label="status.title"
                    density="compact"
                    hide-details
                    class="w-full"
                    color="primary"
                    @update:model-value="toggleStatus(status.value, !!$event)"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getProjectStatusesForGivenLocale } from "@/i18n/projectStatus";
import type { ProjectStatus } from "@/models/ProjectModel";


const props = defineProps<{
    modelValue: ProjectStatus[];
}>();

const emit = defineEmits<{
    (e: "update:modelValue", statuses: ProjectStatus[]): void;
}>();

const projectStatuses = computed(() => getProjectStatusesForGivenLocale() ?? []);

const toggleStatus = (status: ProjectStatus, isSelected: boolean) => {
    const updatedStatuses = props.modelValue.filter(selected => selected !== status);

    if (isSelected) {
        updatedStatuses.push(status);
    }

    emit("update:modelValue", updatedStatuses);
};
</script>

<style scoped>
.status-filter {
    min-width: 280px;
    padding: 12px;
    background: #ffffff;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.filter-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: 0.01em;
}

.checkbox-grid {
    display: grid;
    gap: 8px;
    padding: 4px 0;
}

.checkbox-item {
    padding: 4px 8px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.checkbox-item:hover {
    background-color: #f5f5f5;
}
</style>

<style>
.checkbox-item .v-label--clickable {
    width: 100%;
}
</style>
