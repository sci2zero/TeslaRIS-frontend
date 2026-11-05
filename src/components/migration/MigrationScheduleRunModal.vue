<template>
    <v-dialog
        :model-value="modelValue"
        max-width="640"
        @update:model-value="emit('update:modelValue', $event)">
        <v-card v-if="pipeline">
            <v-card-title>{{ $t("migrationScheduleRunLabel") }}</v-card-title>
            <v-card-text>
                <div class="text-medium-emphasis mb-4 text-caption">
                    {{ $t("migrationScheduleRunExplanationMessage", [pipelineLabel]) }}
                </div>
                <v-form v-model="isFormValid">
                    <v-row>
                        <v-col cols="12" md="6">
                            <ui-input
                                v-model="batchSize"
                                type="number"
                                :label="$t('migrationBatchSizeLabel')"
                                :placeholder="String(pipeline.defaultBatchSize)"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <ui-input
                                v-model="modifiedAfterDays"
                                type="number"
                                :label="$t('migrationModifiedAfterDaysLabel') + '*'"
                                :rules="requiredNumericGreaterThanZeroFieldRules"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <date-picker
                                v-model="scheduleDate"
                                :label="$t('dateLabel') + '*'"
                                color="primary"
                                required
                                in-future
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <time-picker
                                v-model="scheduleTime"
                                :label="$t('timeLabel')"
                                required
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <ui-input
                                v-model="recurrence"
                                control="select"
                                :items="recurrenceOptions"
                                :label="$t('recurrenceTypeLabel') + '*'"
                            />
                        </v-col>
                    </v-row>
                    <div class="mt-2">
                        <ui-checkbox v-model="isUpdate" :label="$t('migrationIsUpdateLabel')" />
                        <ui-checkbox
                            v-model="backfillOnlyCreated"
                            :label="$t('migrationBackfillOnlyCreatedLabel')" />
                        <ui-checkbox
                            v-model="performIndex"
                            :label="$t('migrationPerformIndexLabel')" />
                    </div>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <ui-button variant="outline" @click="close">
                    {{ $t("cancelLabel") }}
                </ui-button>
                <ui-button :loading="scheduling" :disabled="!isFormValid" @click="schedule">
                    {{ $t("scheduleLabel") }}
                </ui-button>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { DateTime } from "luxon";
import DatePicker from "@/components/core/DatePicker.vue";
import TimePicker from "@/components/core/TimePicker.vue";
import UiInput from "@/components/ui/input/Input.vue";
import UiCheckbox from "@/components/ui/checkbox/Checkbox.vue";
import { UiButton } from "@/components/ui/button";
import MigrationService from "@/services/MigrationService";
import { type MigrationPipelineResponse } from "@/models/MigrationModel";
import { RecurrenceType } from "@/models/LoadModel";
import { getRecurrenceTypesForGivenLocale } from "@/i18n/recurrenceType";
import { getErrorMessageForErrorKey } from "@/i18n";
import { useValidationUtils } from "@/utils/ValidationUtils";

const props = defineProps<{
    modelValue: boolean;
    pipeline: MigrationPipelineResponse | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    scheduled: [];
    notify: [message: string];
}>();

const i18n = useI18n();
const { requiredNumericGreaterThanZeroFieldRules } = useValidationUtils();

const isFormValid = ref(false);
const scheduling = ref(false);

const batchSize = ref<string>("");
const modifiedAfterDays = ref<string>("2");
const performIndex = ref(false);
const backfillOnlyCreated = ref(false);
const isUpdate = ref(true);
const recurrence = ref<RecurrenceType>(RecurrenceType.DAILY);
const recurrenceOptions = ref(getRecurrenceTypesForGivenLocale());

const scheduleDate = ref("");
const scheduleTime = ref("");

const pipelineLabel = computed(() =>
    props.pipeline ? `${props.pipeline.source}/${props.pipeline.entityType}` : "");

watch(() => props.modelValue, (opened) => {
    if (!opened) {
        return;
    }

    const fiveMinutesLater = DateTime.local().plus({ minutes: 5 });

    batchSize.value = "";
    modifiedAfterDays.value = "2";
    performIndex.value = false;
    backfillOnlyCreated.value = false;
    isUpdate.value = true;
    recurrence.value = RecurrenceType.DAILY;
    recurrenceOptions.value = getRecurrenceTypesForGivenLocale();
    scheduleDate.value = fiveMinutesLater.toISODate()!;
    scheduleTime.value = fiveMinutesLater.toFormat("HH:mm");
});

const close = () => {
    emit("update:modelValue", false);
};

const schedule = () => {
    if (!props.pipeline || !isFormValid.value) {
        return;
    }

    scheduling.value = true;

    MigrationService.scheduleRun(props.pipeline.source, props.pipeline.entityType, {
        batchSize: batchSize.value ? Number(batchSize.value) : null,
        performIndex: performIndex.value,
        modifiedAfterDays: Number(modifiedAfterDays.value),
        backfillOnlyCreated: backfillOnlyCreated.value,
        isUpdate: isUpdate.value,
        timestamp: `${scheduleDate.value.split("T")[0]}T${scheduleTime.value}:00`,
        recurrence: recurrence.value
    }).then(() => {
        emit("notify", i18n.t("scheduleSuccessMessage"));
        emit("scheduled");
        close();
    }).catch(error => {
        emit("notify", getErrorMessageForErrorKey(error.response?.data?.message));
    }).finally(() => {
        scheduling.value = false;
    });
};
</script>
