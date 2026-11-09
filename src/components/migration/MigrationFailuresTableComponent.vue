<template>
    <responsive-data-table
        :headers="headers"
        :items="failures"
        :items-length="totalFailures"
        :page="page + 1"
        :items-per-page="size"
        container-class="bg-white"
        item-key="sourceKey"
        @update:options="onOptionsChange">
        <template #row="{ item }">
            <tr>
                <td class="whitespace-nowrap">
                    {{ item.entityType }}
                </td>
                <td class="whitespace-nowrap">
                    {{ item.sourceKey }}
                </td>
                <td>{{ displayTextOrPlaceholder(item.reason) }}</td>
                <td class="whitespace-nowrap">
                    {{ formatMoment(item.processedAt) }}
                </td>
            </tr>
        </template>
    </responsive-data-table>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveDataTable from "@/components/core/ResponsiveDataTable.vue";
import { type MigrationFailureResponse } from "@/models/MigrationModel";
import { localiseDate, serverTimeToLocal } from "@/utils/DateUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";

defineProps<{
    failures: MigrationFailureResponse[];
    totalFailures: number;
    page: number;
    size: number;
}>();

const emit = defineEmits<{
    "page-change": [value: { page: number; size: number }];
}>();

const i18n = useI18n();

const headers = computed(() => [
    { title: i18n.t("entityTypeLabel"), align: "start", sortable: false, key: "entityType" },
    { title: i18n.t("migrationSourceKeyLabel"), align: "start", sortable: false, key: "sourceKey" },
    { title: i18n.t("migrationReasonLabel"), align: "start", sortable: false, key: "reason" },
    { title: i18n.t("migrationProcessedAtLabel"), align: "start", sortable: false, key: "processedAt" }
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
