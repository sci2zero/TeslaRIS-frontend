<template>
    <v-dialog
        :model-value="modelValue"
        max-width="640"
        @update:model-value="emit('update:modelValue', $event)">
        <v-card v-if="pipeline">
            <v-card-title>{{ $t("migrationStartRunLabel") }}</v-card-title>
            <v-card-text>
                <div class="text-medium-emphasis mb-4 text-caption">
                    {{ $t("migrationStartRunExplanationMessage", [pipelineLabel]) }}
                </div>
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
                        <date-picker
                            v-model="modifiedAfter"
                            :label="$t('migrationModifiedAfterLabel')"
                            color="primary"
                        />
                    </v-col>
                </v-row>
                <div class="mt-2">
                    <ui-checkbox v-model="isUpdate" :label="$t('migrationIsUpdateLabel')" />
                    <ui-checkbox v-model="resume" :label="$t('migrationResumeLabel')" />
                    <ui-checkbox
                        v-model="backfillOnlyCreated"
                        :label="$t('migrationBackfillOnlyCreatedLabel')" />
                    <ui-checkbox v-model="performIndex" :label="$t('migrationPerformIndexLabel')" />
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <ui-button variant="outline" @click="close">
                    {{ $t("cancelLabel") }}
                </ui-button>
                <ui-button :loading="starting" @click="start">
                    {{ $t("migrationStartRunLabel") }}
                </ui-button>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import DatePicker from "@/components/core/DatePicker.vue";
import UiInput from "@/components/ui/input/Input.vue";
import UiCheckbox from "@/components/ui/checkbox/Checkbox.vue";
import { UiButton } from "@/components/ui/button";
import MigrationService from "@/services/MigrationService";
import { type MigrationPipelineResponse } from "@/models/MigrationModel";
import { toUtcTimestamp } from "@/utils/DateUtil";
import { getErrorMessageForErrorKey } from "@/i18n";

const props = defineProps<{
    modelValue: boolean;
    pipeline: MigrationPipelineResponse | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    started: [runId: string];
    notify: [message: string];
}>();

const i18n = useI18n();

const batchSize = ref<string>("");
const modifiedAfter = ref<string>("");
const performIndex = ref(false);
const resume = ref(false);
const backfillOnlyCreated = ref(false);
const isUpdate = ref(false);
const starting = ref(false);

const pipelineLabel = computed(() =>
    props.pipeline ? `${props.pipeline.source}/${props.pipeline.entityType}` : "");

watch(() => props.modelValue, (opened) => {
    if (!opened) {
        return;
    }

    batchSize.value = "";
    modifiedAfter.value = "";
    performIndex.value = false;
    resume.value = false;
    backfillOnlyCreated.value = false;
    isUpdate.value = false;
});

const close = () => {
    emit("update:modelValue", false);
};

const start = () => {
    if (!props.pipeline) {
        return;
    }

    starting.value = true;

    MigrationService.startRun(props.pipeline.source, props.pipeline.entityType, {
        batchSize: batchSize.value ? Number(batchSize.value) : null,
        performIndex: performIndex.value,
        resume: resume.value,
        // The source reads the moment from the TeslaRIS hydrator, which takes an ISO instant.
        modifiedAfter: modifiedAfter.value
            ? toUtcTimestamp(`${modifiedAfter.value.split("T")[0]}T00:00:00`)
            : null,
        backfillOnlyCreated: backfillOnlyCreated.value,
        isUpdate: isUpdate.value
    }).then(response => {
        emit("notify", i18n.t("migrationRunStartedMessage", [response.data]));
        emit("started", response.data);
        close();
    }).catch(error => {
        emit("notify", getErrorMessageForErrorKey(error.response?.data?.message));
    }).finally(() => {
        starting.value = false;
    });
};
</script>
