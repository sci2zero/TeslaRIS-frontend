<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("scheduleLoadingLabel") }}
    </h1>
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
            />
        </v-col>
        <v-col cols="1">
            <time-picker></time-picker>
        </v-col>
        <v-col cols="1">
            <v-btn class="mt-3">
                Schedule
            </v-btn>
        </v-col>
    </v-row>
    <v-row class="d-flex flex-row justify-center">
        <v-col cols="6">
            <v-data-table :items="scheduledTasks" :headers="headers">
                <template #item="row">
                    <tr>
                        <td>{{ row.item.taskId }}</td>
                        <td>{{ `${localiseDate(row.item.executionTime.split("T")[0])} ${$t("inLabel")} ${row.item.executionTime.split("T")[1]}` }}</td>
                        <td><v-btn>Delete</v-btn></td>
                    </tr>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
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


export default defineComponent({
    name: "IndicatorsLoadView",
    components: { TimePicker, DatePicker },
    setup() {
        const scheduleDate = ref();
        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

        const applicableTypes = ref<{ title: string, value: ApplicableEntityType }[]>([]);
        const selectedEntityType = ref<{ title: string, value: ApplicableEntityType }>({title: getApplicableEntityTypeTitleFromValueAutoLocale(ApplicableEntityType.PUBLICATION_SERIES) as string, value: ApplicableEntityType.PUBLICATION_SERIES});

        const sources = ref<{ title: string, value: EntityIndicatorSource }[]>([]);
        const selectedSource = ref<{ title: string, value: EntityIndicatorSource }>({title: getIndicatorSourceTitleFromValueAutoLocale(EntityIndicatorSource.WEB_OF_SCIENCE) as string, value: EntityIndicatorSource.WEB_OF_SCIENCE});

        const { requiredSelectionRules } = useValidationUtils();

        const i18n = useI18n();

        onMounted(() => {
            TaskManagerService.listScheduledTasks().then((response) => {
                scheduledTasks.value = response.data;
            });

            populateSelectionData();
        });

        watch(i18n.locale, () => {
            populateSelectionData();
        });

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

        return {
            scheduleDate, scheduledTasks,
            applicableTypes, selectedEntityType,
            selectedSource, requiredSelectionRules,
            sources, localiseDate, headers
        };
    },
});
</script>
