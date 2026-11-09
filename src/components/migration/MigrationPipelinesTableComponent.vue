<template>
    <div class="min-w-0 overflow-x-auto">
        <v-data-table
            :items="pipelines"
            :headers="headers"
            :loading="loading"
            :no-data-text="$t('noDataInTableMessage')"
            :items-per-page-text="$t('itemsPerPageLabel')"
        >
            <template #item="row">
                <tr>
                    <td>{{ row.item.source }}</td>
                    <td>{{ row.item.entityType }}</td>
                    <td>{{ row.item.defaultBatchSize }}</td>
                    <td>
                        <migration-run-status-chip
                            :status="row.item.running ? MigrationRunStatus.RUNNING : 'IDLE'" />
                    </td>
                    <td>
                        <div class="flex flex-wrap gap-2 py-1">
                            <ui-button
                                size="sm"
                                :disabled="row.item.running"
                                @click="emit('start', row.item)">
                                {{ $t("migrationStartRunLabel") }}
                            </ui-button>
                            <ui-button
                                variant="outline"
                                size="sm"
                                @click="emit('schedule', row.item)">
                                {{ $t("scheduleLabel") }}
                            </ui-button>
                            <ui-button
                                variant="outline"
                                size="sm"
                                @click="emit('runs', row.item)">
                                {{ $t("migrationRunsLabel") }}
                            </ui-button>
                        </div>
                    </td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { UiButton } from "@/components/ui/button";
import MigrationRunStatusChip from "@/components/migration/MigrationRunStatusChip.vue";
import { MigrationRunStatus, type MigrationPipelineResponse } from "@/models/MigrationModel";

defineProps<{
    pipelines: MigrationPipelineResponse[];
    loading?: boolean;
}>();

const emit = defineEmits<{
    start: [pipeline: MigrationPipelineResponse];
    schedule: [pipeline: MigrationPipelineResponse];
    runs: [pipeline: MigrationPipelineResponse];
}>();

const i18n = useI18n();

const headers = computed(() => [
    { title: i18n.t("sourceLabel"), align: "start", sortable: true, key: "source" },
    { title: i18n.t("entityTypeLabel"), align: "start", sortable: true, key: "entityType" },
    { title: i18n.t("migrationDefaultBatchSizeLabel"), align: "start", sortable: false, key: "defaultBatchSize" },
    { title: i18n.t("statusLabel"), align: "start", sortable: false, key: "running" },
    { title: i18n.t("actionLabel"), align: "start", sortable: false }
]);
</script>
