<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("scheduleLoadingLabel") }}
    </h1>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center mt-10">
            <v-col cols="2">
                <v-select
                    v-model="selectedEntityType"
                    :items="applicableTypes"
                    :label="$t('applicableTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="false">
                </v-select>
            </v-col>
            <v-col cols="2">
                <v-select
                    v-model="selectedSource"
                    :items="sources"
                    :label="$t('sourceLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="false">
                </v-select>
            </v-col>
            <v-col cols="2">
                <date-picker
                    v-model="scheduleDate"
                    :label="$t('dateLabel') + '*'"
                    color="primary"
                    required
                    in-future
                />
            </v-col>
            <v-col cols="1">
                <time-picker v-model="scheduledTime" :label="$t('timeLabel')" required></time-picker>
            </v-col>
            <v-col cols="1">
                <v-btn class="mt-3" :disabled="!isFormValid" @click="scheduleLoadTask">
                    {{ $t("scheduleLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
    <v-row class="d-flex flex-row justify-center">
        <v-col cols="6">
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

    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ message }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import TimePicker from "@/components/core/TimePicker.vue";
import DatePicker from "@/components/core/DatePicker.vue";
import TaskManagerService from "@/services/TaskManagerService";
import { ApplicableEntityType, type ScheduledTaskResponse } from "@/models/Common";
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getApplicableEntityTypesForGivenLocale, getApplicableEntityTypeTitleFromValueAutoLocale } from "@/i18n/applicableEntityType";
import { useI18n } from "vue-i18n";
import { EntityIndicatorSource } from "@/models/AssessmentModel";
import { getIndicatorSourceForGivenLocale, getIndicatorSourceTitleFromValueAutoLocale } from "@/i18n/entityIndicatorSource";
import { localiseDate } from "@/i18n/dateLocalisation";
import { getErrorMessageForErrorKey } from "@/i18n";


export default defineComponent({
    name: "IndicatorsLoadView",
    components: { TimePicker, DatePicker },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);
        const message = ref("");

        const scheduleDate = ref();
        const scheduledTime = ref();

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

        const applicableTypes = ref<{ title: string, value: ApplicableEntityType }[]>([]);
        const selectedEntityType = ref<{ title: string, value: ApplicableEntityType }>({title: getApplicableEntityTypeTitleFromValueAutoLocale(ApplicableEntityType.PUBLICATION_SERIES) as string, value: ApplicableEntityType.PUBLICATION_SERIES});

        const sources = ref<{ title: string, value: EntityIndicatorSource }[]>([]);
        const selectedSource = ref<{ title: string, value: EntityIndicatorSource }>({title: getIndicatorSourceTitleFromValueAutoLocale(EntityIndicatorSource.WEB_OF_SCIENCE) as string, value: EntityIndicatorSource.WEB_OF_SCIENCE});

        const { requiredSelectionRules } = useValidationUtils();

        const i18n = useI18n();

        onMounted(() => {
            fetchScheduledTasks();

            populateSelectionData();
            setInterval(fetchScheduledTasks, 1000 * 60);
        });

        watch(i18n.locale, () => {
            populateSelectionData();
        });

        const fetchScheduledTasks = () => {
            TaskManagerService.listScheduledTasks().then((response) => {
                scheduledTasks.value = response.data;
            });
        };

        const populateSelectionData = () => {
            applicableTypes.value = (getApplicableEntityTypesForGivenLocale() as { title: string, value: ApplicableEntityType }[]).filter(item => item.value === ApplicableEntityType.PUBLICATION_SERIES);
            sources.value = (getIndicatorSourceForGivenLocale() as { title: string, value: EntityIndicatorSource }[]).filter(item => item.value !== EntityIndicatorSource.MANUAL);
        };

        const dateLabel = computed(() => i18n.t("dateLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        const headers = [
          { title: "Task ID", align: "start", sortable: false, key: "taskId"},
          { title: dateLabel, align: "start", sortable: false, key: "executionTime"},
          { title: actionLabel, align: "start", sortable: false}
        ];

        const scheduleLoadTask = () => {
            TaskManagerService.scheduleIndicatorLoadingTask(createTimestamp(scheduleDate.value, scheduledTime.value), selectedSource.value.value).then(() => {
                message.value = i18n.t("scheduleSuccessMessage");
                snackbar.value = true;
                fetchScheduledTasks();
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const deleteScheduledLoadTask = (taskId: string) => {
            TaskManagerService.canceltask(taskId).then(() => {
                message.value = i18n.t("cancelSuccessMessage");
                snackbar.value = true;
                fetchScheduledTasks();
            }).catch(() => {
                message.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const createTimestamp = (date: string, time: string): string => {
            const localDate = date.split("T")[0];
            const localTime = time + ":00";
            return `${localDate}T${localTime}`;
        };

        const isDateTimeInPast = (dateTime: string) => {
            const date = new Date(dateTime);
            const now = new Date();
            console.log(date, now)

            return date <= now;
        };

        return {
            scheduleDate, scheduledTasks,
            applicableTypes, selectedEntityType,
            selectedSource, requiredSelectionRules,
            sources, localiseDate, headers,
            scheduleLoadTask, scheduledTime,
            isFormValid, snackbar, message,
            deleteScheduledLoadTask,
            isDateTimeInPast
        };
    },
});
</script>
