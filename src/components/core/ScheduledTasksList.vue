<template>
    <v-row class="d-flex flex-row justify-center">
        <v-col cols="12" md="6">
            <v-data-table 
                :items="scheduledTasks"
                :headers="headers"
                :no-data-text="$t('noDataInTableMessage')"
                :items-per-page-text="$t('itemsPerPageLabel')"
            >
                <template #item="row">
                    <tr>
                        <td>{{ row.item.taskId }}</td>
                        <td>{{ `${localiseDate(row.item.executionTime.split("T")[0])} ${$t("inLabel")} ${row.item.executionTime.split("T")[1]}` }}</td>
                        <td>
                            <v-btn v-if="!isDateTimeInPast(row.item.executionTime)" @click="deleteScheduledLoadTask(row.item.taskId)">
                                {{ $t("cancelLabel") }}
                            </v-btn>
                            <p v-else>
                                {{ $t("inProgressLabel") }}
                            </p>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { type ScheduledTaskResponse } from "@/models/Common";
import { useI18n } from "vue-i18n";
import { localiseDate } from "@/i18n/dateLocalisation";


export default defineComponent({
    name: "ScheduledTasksList",
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
        const headers = [
          { title: "Task ID", align: "start", sortable: false, key: "taskId"},
          { title: dateLabel, align: "start", sortable: false, key: "executionTime"},
          { title: actionLabel, align: "start", sortable: false}
        ];

        return {
            deleteScheduledLoadTask,
            isDateTimeInPast,
            localiseDate, headers
        };
    },
});
</script>
