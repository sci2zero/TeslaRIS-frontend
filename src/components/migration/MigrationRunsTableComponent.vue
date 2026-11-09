<template>
    <responsive-data-table
        :headers="headers"
        :items="runs"
        :items-length="totalRuns"
        :page="page + 1"
        :items-per-page="size"
        container-class="bg-white"
        item-key="runId"
        @update:options="onOptionsChange">
        <template #row="{ item }">
            <tr>
                <td class="whitespace-nowrap">
                    {{ item.runId }}
                </td>
                <td>
                    <migration-run-status-chip :status="item.status" />
                </td>
                <td class="whitespace-nowrap">
                    {{ formatMoment(item.startedAt) }}
                </td>
                <td class="whitespace-nowrap">
                    {{ formatMoment(item.finishedAt) }}
                </td>
                <td>{{ item.recordsRead }}</td>
                <td>{{ item.itemsCreated }}</td>
                <td>{{ item.itemsUpdated }}</td>
                <td>{{ item.itemsResolved }}</td>
                <td>{{ item.itemsSkipped }}</td>
                <td>{{ item.itemsFailed }}</td>
                <td>
                    <div class="flex flex-wrap gap-2 py-1">
                        <ui-button
                            variant="outline"
                            size="sm"
                            :disabled="item.itemsFailed === 0"
                            @click="emit('show-failures', item)">
                            {{ $t("migrationShowFailuresLabel") }}
                        </ui-button>
                        <ui-button
                            variant="outline"
                            size="sm"
                            :disabled="item.itemsFailed === 0 || item.status === MigrationRunStatus.RUNNING"
                            @click="emit('retry-failed', item)">
                            {{ $t("migrationRetryFailedLabel") }}
                        </ui-button>
                    </div>
                </td>
            </tr>
        </template>
    </responsive-data-table>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { UiButton } from "@/components/ui/button";
import ResponsiveDataTable from "@/components/core/ResponsiveDataTable.vue";
import MigrationRunStatusChip from "@/components/migration/MigrationRunStatusChip.vue";
import { MigrationRunStatus, type MigrationRunResponse } from "@/models/MigrationModel";
import { localiseDate, serverTimeToLocal } from "@/utils/DateUtil";

defineProps<{
    runs: MigrationRunResponse[];
    totalRuns: number;
    page: number;
    size: number;
}>();

const emit = defineEmits<{
    "page-change": [value: { page: number; size: number }];
    "retry-failed": [run: MigrationRunResponse];
    "show-failures": [run: MigrationRunResponse];
}>();

const i18n = useI18n();

const headers = computed(() => [
    { title: i18n.t("migrationRunIdLabel"), align: "start", sortable: false, key: "runId" },
    { title: i18n.t("statusLabel"), align: "start", sortable: false, key: "status" },
    { title: i18n.t("migrationStartedAtLabel"), align: "start", sortable: false, key: "startedAt" },
    { title: i18n.t("migrationFinishedAtLabel"), align: "start", sortable: false, key: "finishedAt" },
    { title: i18n.t("migrationRecordsReadLabel"), align: "start", sortable: false, key: "recordsRead" },
    { title: i18n.t("migrationCreatedLabel"), align: "start", sortable: false, key: "itemsCreated" },
    { title: i18n.t("migrationUpdatedLabel"), align: "start", sortable: false, key: "itemsUpdated" },
    { title: i18n.t("migrationResolvedLabel"), align: "start", sortable: false, key: "itemsResolved" },
    { title: i18n.t("migrationSkippedLabel"), align: "start", sortable: false, key: "itemsSkipped" },
    { title: i18n.t("migrationFailedItemsLabel"), align: "start", sortable: false, key: "itemsFailed" },
    { title: i18n.t("actionLabel"), align: "start", sortable: false }
]);

const formatMoment = (moment: string | null) => {
    if (!moment) {
        return "-";
    }

    const local = serverTimeToLocal(moment);

    return `${localiseDate(local.split("T")[0])} ${local.split("T")[1]?.substring(0, 5) ?? ""}`;
};

const onOptionsChange = (event: any) => {
    emit("page-change", { page: event.page - 1, size: event.itemsPerPage });
};
</script>
