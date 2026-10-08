<template>
    <div class="entity-filter-panel">
        <div class="filter-header">
            <span class="entity-filter-panel__title">{{ $t('statusLabel') }}</span>
        </div>
        <v-divider class="my-2" />
        <div class="checkbox-grid">
            <div
                v-for="status in projectStatuses"
                :key="status.value"
                class="checkbox-item"
            >
                <ui-checkbox
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
import UiCheckbox from "@/components/ui/checkbox/Checkbox.vue";
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
