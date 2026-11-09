<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1300"
        scrollable
        @update:model-value="emit('update:modelValue', $event)">
        <v-card v-if="pipeline">
            <v-card-title>{{ $t("migrationRunsLabel") }}</v-card-title>
            <v-card-text>
                <div class="text-medium-emphasis mb-4 text-caption">
                    {{ $t("migrationRunsExplanationMessage", [pipelineLabel]) }}
                </div>
                <migration-runs-table-component
                    :runs="runs"
                    :total-runs="totalRuns"
                    :page="page"
                    :size="size"
                    @page-change="onPageChange"
                    @retry-failed="retryFailed"
                    @show-failures="showFailures"
                />
            </v-card-text>
            <v-card-actions>
                <ui-button variant="outline" @click="fetchRuns">
                    {{ $t("refreshLabel") }}
                </ui-button>
                <v-spacer />
                <ui-button variant="outline" @click="emit('update:modelValue', false)">
                    {{ $t("closeLabel") }}
                </ui-button>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <migration-failures-modal
        v-model="failuresModal"
        :run-id="runOfFailures"
        @notify="emit('notify', $event)"
    />
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { UiButton } from "@/components/ui/button";
import MigrationRunsTableComponent from "@/components/migration/MigrationRunsTableComponent.vue";
import MigrationFailuresModal from "@/components/migration/MigrationFailuresModal.vue";
import MigrationService from "@/services/MigrationService";
import {
    MigrationRunStatus,
    type MigrationPipelineResponse,
    type MigrationRunResponse
} from "@/models/MigrationModel";
import { getErrorMessageForErrorKey } from "@/i18n";

const REFRESH_INTERVAL_MS = 10_000;

const props = defineProps<{
    modelValue: boolean;
    pipeline: MigrationPipelineResponse | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    notify: [message: string];
    "runs-changed": [];
}>();

const i18n = useI18n();

const runs = ref<MigrationRunResponse[]>([]);
const totalRuns = ref(0);
const page = ref(0);
const size = ref(10);

const failuresModal = ref(false);
const runOfFailures = ref<string | null>(null);

let refreshIntervalId: ReturnType<typeof setInterval> | null = null;

const pipelineLabel = computed(() =>
    props.pipeline ? `${props.pipeline.source}/${props.pipeline.entityType}` : "");

const fetchRuns = () => {
    if (!props.pipeline) {
        return;
    }

    MigrationService.listRuns(props.pipeline.source, props.pipeline.entityType, page.value,
        size.value).then(response => {
        runs.value = response.data.content;
        totalRuns.value = response.data.totalElements;
    }).catch(error => {
        runs.value = [];
        totalRuns.value = 0;
        emit("notify", getErrorMessageForErrorKey(error.response?.data?.message));
    });
};

const refreshRunningRuns = () => {
    runs.value
        .filter(run => run.status === MigrationRunStatus.RUNNING)
        .forEach(run => {
            MigrationService.getRun(run.runId).then(response => {
                const index = runs.value.findIndex(listed => listed.runId === run.runId);

                if (index < 0) {
                    return;
                }

                runs.value[index] = response.data;

                if (response.data.status !== MigrationRunStatus.RUNNING) {
                    emit("runs-changed");
                }
            }).catch(() => {
                // A refresh of one row must not empty the listing.
            });
        });
};

const stopRefreshing = () => {
    if (refreshIntervalId !== null) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
};

watch(() => props.modelValue, (opened) => {
    if (!opened) {
        stopRefreshing();
        return;
    }

    page.value = 0;
    fetchRuns();
    refreshIntervalId = setInterval(refreshRunningRuns, REFRESH_INTERVAL_MS);
});

onUnmounted(stopRefreshing);

const onPageChange = (options: { page: number; size: number }) => {
    page.value = options.page;
    size.value = options.size;
    fetchRuns();
};

const showFailures = (run: MigrationRunResponse) => {
    runOfFailures.value = run.runId;
    failuresModal.value = true;
};

const retryFailed = (run: MigrationRunResponse) => {
    MigrationService.retryFailed(run.runId).then(response => {
        emit("notify", i18n.t("migrationRetryStartedMessage", [response.data]));
        emit("runs-changed");
        fetchRuns();
    }).catch(error => {
        emit("notify", getErrorMessageForErrorKey(error.response?.data?.message));
    });
};
</script>
