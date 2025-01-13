<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("scheduleTasksLabel") }}
    </h1>
    <v-row class="d-flex flex-row justify-center mt-10">
        <v-col cols="2">
            <v-select
                v-model="selectedScheduledTaskType"
                :items="scheduledTaskTypes"
                :label="$t('scheduledTaskTypeLabel')"
                :readonly="false">
            </v-select>
        </v-col>
    </v-row>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center mt-5">
            <v-col v-if="selectedScheduledTaskType !== ScheduledTaskType.REINDEXING" cols="2">
                <v-select
                    v-model="selectedApplicableEntityType"
                    :items="applicableTypes"
                    :label="$t('applicableTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="false">
                </v-select>
            </v-col>
            <v-col v-if="selectedScheduledTaskType === ScheduledTaskType.REINDEXING" cols="2">
                <v-select
                    v-model="selectedEntityTypes"
                    :items="entityTypes"
                    :label="$t('entityTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    multiple>
                </v-select>
            </v-col>
            <v-col v-if="selectedScheduledTaskType === ScheduledTaskType.INDICATOR_LOAD" cols="2">
                <v-select
                    v-model="selectedSource"
                    :items="sources"
                    :label="$t('sourceLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="false">
                </v-select>
            </v-col>
            <v-col v-if="selectedScheduledTaskType === ScheduledTaskType.CLASSIFICATION_COMPUTATION" cols="2">
                <commission-autocomplete-search v-model="selectedCommission"></commission-autocomplete-search>
            </v-col>
            <v-col v-if="selectedScheduledTaskType === ScheduledTaskType.CLASSIFICATION_COMPUTATION || selectedScheduledTaskType === ScheduledTaskType.IF5_COMPUTATION" cols="2">
                <v-select
                    v-model="selectedYears"
                    :items="years"
                    :label="$t('yearsLabel')"
                    multiple>
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

    <scheduled-tasks-list :scheduled-tasks="scheduledTasks" @delete="deleteScheduledLoadTask"></scheduled-tasks-list>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import TimePicker from "@/components/core/TimePicker.vue";
import DatePicker from "@/components/core/DatePicker.vue";
import TaskManagerService from "@/services/TaskManagerService";
import { ApplicableEntityType, ScheduledTaskType, type ScheduledTaskResponse } from "@/models/Common";
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getApplicableEntityTypesForGivenLocale, getApplicableEntityTypeTitleFromValueAutoLocale } from "@/i18n/applicableEntityType";
import { useI18n } from "vue-i18n";
import { EntityIndicatorSource } from "@/models/AssessmentModel";
import { getIndicatorSourceForGivenLocale, getIndicatorSourceTitleFromValueAutoLocale } from "@/i18n/entityIndicatorSource";
import { getErrorMessageForErrorKey } from "@/i18n";
import Toast from "@/components/core/Toast.vue";
import { getScheduledTaskTypeForGivenLocale } from "@/i18n/scheduledTaskType";
import CommissionAutocompleteSearch from "@/components/assessment/commission/CommissionAutocompleteSearch.vue";
import { AxiosError } from "axios";
import ScheduledTasksList from "@/components/core/ScheduledTasksList.vue";
import { getEntityTypeForGivenLocale } from "@/i18n/entityType";
import { EntityType } from "@/models/MergeModel";


export default defineComponent({
    name: "IndicatorsLoadView",
    components: { TimePicker, DatePicker, Toast, CommissionAutocompleteSearch, ScheduledTasksList },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);
        const message = ref("");

        const scheduleDate = ref();
        const scheduledTime = ref();

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

        const applicableTypes = ref<{ title: string, value: ApplicableEntityType }[]>([]);
        const selectedApplicableEntityType = ref<{ title: string, value: ApplicableEntityType }>({title: getApplicableEntityTypeTitleFromValueAutoLocale(ApplicableEntityType.PUBLICATION_SERIES) as string, value: ApplicableEntityType.PUBLICATION_SERIES});

        const sources = ref<{ title: string, value: EntityIndicatorSource }[]>([]);
        const selectedSource = ref<{ title: string, value: EntityIndicatorSource }>({title: getIndicatorSourceTitleFromValueAutoLocale(EntityIndicatorSource.WEB_OF_SCIENCE) as string, value: EntityIndicatorSource.WEB_OF_SCIENCE});

        const { requiredSelectionRules } = useValidationUtils();

        const i18n = useI18n();

        const scheduledTaskTypes = getScheduledTaskTypeForGivenLocale();
        const selectedScheduledTaskType = ref<ScheduledTaskType>(ScheduledTaskType.INDICATOR_LOAD);

        const years = ref<number[]>([]);
        const selectedYears = ref<number[]>([(new Date()).getFullYear()]);

        const searchPlaceholder = {title: "", value: -1};
        const selectedCommission = ref<{ title: string, value: number }>(searchPlaceholder);

        const entityTypes = getEntityTypeForGivenLocale();
        const selectedEntityTypes = ref<{ title: string, value: EntityType }[]>([...entityTypes]);

        onMounted(() => {
            fetchScheduledTasks();

            populateSelectionData();
            
            const now = new Date();
            const secondsUntilNextMinute = 60 - now.getSeconds();
            const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000;

            for(let i = 1999; i <= now.getFullYear(); i++) {
                years.value.push(i);
            }

            setTimeout(() => {
                fetchScheduledTasks();
                setInterval(fetchScheduledTasks, 1000 * 60);
            }, millisecondsUntilNextMinute);
        });

        watch(i18n.locale, () => {
            populateSelectionData();
        });

        const fetchScheduledTasks = () => {
            TaskManagerService.listScheduledTasks().then((response) => {
                scheduledTasks.value = response.data;
                scheduledTasks.value.sort((a, b) => {
                    if(!a.executionTime) {
                        return 1;
                    }

                    return a.executionTime.localeCompare(b.executionTime);
                });
            });
        };

        const populateSelectionData = () => {
            applicableTypes.value = (getApplicableEntityTypesForGivenLocale() as { title: string, value: ApplicableEntityType }[]).filter(item => item.value === ApplicableEntityType.PUBLICATION_SERIES);
            sources.value = (getIndicatorSourceForGivenLocale() as { title: string, value: EntityIndicatorSource }[]).filter(item => item.value !== EntityIndicatorSource.MANUAL);
        };

        const scheduleTask = (taskFunction: any) => {
            taskFunction()
                .then(() => {
                    message.value = i18n.t("scheduleSuccessMessage");
                    snackbar.value = true;
                    fetchScheduledTasks();
                })
                .catch((error: AxiosError<Error>) => {
                    message.value = getErrorMessageForErrorKey(error.response?.data?.message || "defaultErrorKey");
                    snackbar.value = true;
                });
        };

        const scheduleLoadTask = () => {
            const timestamp = createTimestamp(scheduleDate.value, scheduledTime.value);

            switch (selectedScheduledTaskType.value) {
                case ScheduledTaskType.INDICATOR_LOAD:
                    scheduleTask(() => 
                        TaskManagerService.scheduleIndicatorLoadingTask(
                            timestamp, selectedSource.value.value
                        )
                    );
                    break;

                case ScheduledTaskType.IF5_COMPUTATION:
                    scheduleTask(() => 
                        TaskManagerService.scheduleIF5RankComputationTask(
                            timestamp, selectedYears.value
                        )
                    );
                    break;

                case ScheduledTaskType.CLASSIFICATION_COMPUTATION:
                    scheduleTask(() => 
                        TaskManagerService.scheduleClassificationComputationTask(
                            timestamp, selectedCommission.value.value, selectedYears.value
                        )
                    );
                    break;

                case ScheduledTaskType.REINDEXING:
                    scheduleTask(() => 
                        TaskManagerService.scheduleDatabaseReindexing(
                            timestamp, selectedEntityTypes.value.map(entityType => entityType.value)
                        )
                    );
                    break;

                default:
                    message.value = i18n.t("invalidTaskTypeMessage");
                    snackbar.value = true;
                    break;
            }
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

        return {
            scheduleDate, scheduledTasks,
            applicableTypes, selectedApplicableEntityType,
            selectedSource, requiredSelectionRules,
            scheduleLoadTask, scheduledTime,
            isFormValid, snackbar, message,
            deleteScheduledLoadTask,
            scheduledTaskTypes, sources,
            selectedScheduledTaskType,
            ScheduledTaskType, years,
            selectedYears, selectedCommission,
            entityTypes, selectedEntityTypes
        };
    },
});
</script>
