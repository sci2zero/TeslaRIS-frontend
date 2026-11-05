<template>
    <v-container>
        <v-card class="assessment-context-bar mb-5" variant="flat">
            <v-card-text class="d-flex flex-wrap align-center justify-center text-center">
                <div class="context-block">
                    <div class="context-label">
                        {{ $t("migrationControlPanelLabel") }}
                    </div>
                    <div class="context-value">
                        {{ currentTabLabel }}
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <v-tabs v-model="currentTab" color="primary" align-tabs="center">
            <v-tab value="pipelines">
                {{ $t("migrationPipelinesLabel") }}
            </v-tab>
            <v-tab value="scheduledTasks">
                {{ $t("scheduleTasksLabel") }}
            </v-tab>
        </v-tabs>

        <div v-if="currentTab === 'pipelines'" class="mt-4">
            <div class="text-medium-emphasis mb-4 text-caption">
                {{ $t("migrationPipelinesExplanationMessage") }}
            </div>

            <tab-content-loader v-if="loading" :button-header="false" layout="table" />

            <migration-pipelines-table-component
                v-else
                :pipelines="pipelines"
                @start="openStartModal"
                @schedule="openScheduleModal"
                @runs="openRunsModal"
            />
        </div>

        <div v-else class="mt-4">
            <scheduled-tasks-list
                :scheduled-tasks="scheduledTasks"
                @delete="cancelScheduledTask"
            />
        </div>

        <migration-start-run-modal
            v-model="startModal"
            :pipeline="selectedPipeline"
            @notify="notify"
            @started="fetchPipelines"
        />

        <migration-schedule-run-modal
            v-model="scheduleModal"
            :pipeline="selectedPipeline"
            @notify="notify"
            @scheduled="fetchScheduledTasks"
        />

        <migration-runs-modal
            v-model="runsModal"
            :pipeline="selectedPipeline"
            @notify="notify"
            @runs-changed="fetchPipelines"
        />

        <toast v-model="snackbar" :message="message" />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import Toast from "@/components/core/Toast.vue";
import ScheduledTasksList from "@/components/core/ScheduledTasksList.vue";
import MigrationPipelinesTableComponent from "@/components/migration/MigrationPipelinesTableComponent.vue";
import MigrationStartRunModal from "@/components/migration/MigrationStartRunModal.vue";
import MigrationScheduleRunModal from "@/components/migration/MigrationScheduleRunModal.vue";
import MigrationRunsModal from "@/components/migration/MigrationRunsModal.vue";
import MigrationService from "@/services/MigrationService";
import TaskManagerService from "@/services/TaskManagerService";
import { type MigrationPipelineResponse } from "@/models/MigrationModel";
import { type ScheduledTaskResponse } from "@/models/Common";
import { getErrorMessageForErrorKey } from "@/i18n";
import { useInterval } from "@/composables/useInterval";

const i18n = useI18n();

const currentTab = ref("pipelines");
const loading = ref(false);

const currentTabLabel = computed(() => currentTab.value === "pipelines"
    ? i18n.t("migrationPipelinesLabel")
    : i18n.t("scheduleTasksLabel"));

const snackbar = ref(false);
const message = ref("");

const pipelines = ref<MigrationPipelineResponse[]>([]);
const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

const selectedPipeline = ref<MigrationPipelineResponse | null>(null);
const startModal = ref(false);
const scheduleModal = ref(false);
const runsModal = ref(false);

const notify = (text: string) => {
    message.value = text;
    snackbar.value = true;
};

const fetchPipelines = () => {
    MigrationService.listPipelines().then(response => {
        pipelines.value = response.data;
    }).catch(error => {
        pipelines.value = [];
        notify(getErrorMessageForErrorKey(error.response?.data?.message));
    }).finally(() => {
        loading.value = false;
    });
};

const fetchScheduledTasks = () => {
    TaskManagerService.listScheduledMigrationTasks().then(response => {
        scheduledTasks.value = response.data;
    }).catch(() => {
        scheduledTasks.value = [];
    });
};

// A pipeline that runs becomes idle without a request of the operator, so the status is refreshed.
const { startInterval } = useInterval(fetchPipelines, 1000 * 30);

onMounted(() => {
    document.title = i18n.t("migrationControlPanelLabel");

    loading.value = true;
    startInterval();
    fetchScheduledTasks();
});

watch(() => i18n.locale.value, () => {
    document.title = i18n.t("migrationControlPanelLabel");
});

const cancelScheduledTask = (taskId: string) => {
    TaskManagerService.canceltask(taskId).then(() => {
        notify(i18n.t("deleteSuccessNotification", { name: taskId }));
        fetchScheduledTasks();
    }).catch(error => {
        notify(getErrorMessageForErrorKey(error.response?.data?.message));
    });
};

const openStartModal = (pipeline: MigrationPipelineResponse) => {
    selectedPipeline.value = pipeline;
    startModal.value = true;
};

const openScheduleModal = (pipeline: MigrationPipelineResponse) => {
    selectedPipeline.value = pipeline;
    scheduleModal.value = true;
};

const openRunsModal = (pipeline: MigrationPipelineResponse) => {
    selectedPipeline.value = pipeline;
    runsModal.value = true;
};
</script>

<style scoped>
.assessment-context-bar {
    background-color: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
}

.context-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
}

.context-value {
    font-weight: 600;
}
</style>
