<template>
    <div class="min-w-0 overflow-x-auto">
        <v-data-table
            :items="scheduledTasks"
            :headers="headers"
            :no-data-text="$t('noDataInTableMessage')"
            :items-per-page-text="$t('itemsPerPageLabel')"
        >
            <template #item="row">
                <tr>
                    <td>{{ row.item.taskId }}</td>
                    <td>{{ `${localiseDate(serverTimeToLocal(row.item.executionTime).split("T")[0])} ${$t("inLabel")} ${serverTimeToLocal(row.item.executionTime).split("T")[1]}` }}</td>
                    <td>{{ getRecurrenceTypeTitleFromValueAutoLocale(row.item.recurrenceType) }}</td>
                    <td>
                        <ui-button v-if="!isDateTimeInPast(serverTimeToLocal(row.item.executionTime))" variant="outline" size="sm" @click="deleteScheduledLoadTask(row.item.taskId)">
                            {{ $t("cancelLabel") }}
                        </ui-button>
                        <p v-else>
                            {{ $t("inProgressLabel") }}
                        </p>
                    </td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
import { UiButton } from "@/components/ui/button";
import { computed, defineComponent } from "vue";
import { type ScheduledTaskResponse } from "@/models/Common";
import { useI18n } from "vue-i18n";
import { localiseDate, serverTimeToLocal } from "@/utils/DateUtil";
import { getRecurrenceTypeTitleFromValueAutoLocale } from "@/i18n/recurrenceType";


export default defineComponent({
    name: "ScheduledTasksList",
    components: { UiButton },
    props: {
        scheduledTasks: {
            type: Array<ScheduledTaskResponse>,
            required: true
        }
    },
    emits: ["delete"],
    setup(_, {emit}) {
        const i18n = useI18n();

        const deleteScheduledLoadTask = (taskId: string) => {
            emit("delete", taskId);
        };

        const isDateTimeInPast = (dateTime: string) => {
            const date = new Date(dateTime);
            const now = new Date();

            return date <= now;
        };

        const dateLabel = computed(() => i18n.t("dateLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        const recurrenceTypeLabel = computed(() => i18n.t("recurrenceTypeLabel"));

        const headers = [
          { title: "Task ID", align: "start", sortable: false, key: "taskId"},
          { title: dateLabel, align: "start", sortable: false, key: "executionTime"},
          { title: recurrenceTypeLabel, align: "start", sortable: false, key: "recurrenceType"},
          { title: actionLabel, align: "start", sortable: false}
        ];

        return {
            deleteScheduledLoadTask, isDateTimeInPast,
            localiseDate, headers, serverTimeToLocal,
            getRecurrenceTypeTitleFromValueAutoLocale
        };
    },
});
</script>
