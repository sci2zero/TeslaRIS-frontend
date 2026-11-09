<template>
    <v-chip :color="color" size="small" variant="tonal" :prepend-icon="icon">
        {{ label }}
    </v-chip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { MigrationRunStatus } from "@/models/MigrationModel";

const props = defineProps<{
    status: MigrationRunStatus | "IDLE";
}>();

const i18n = useI18n();

const label = computed(() => {
    switch (props.status) {
        case MigrationRunStatus.RUNNING:
            return i18n.t("migrationStatusRunningLabel");
        case MigrationRunStatus.FINISHED:
            return i18n.t("migrationStatusFinishedLabel");
        case MigrationRunStatus.FAILED:
            return i18n.t("migrationStatusFailedLabel");
        default:
            return i18n.t("migrationStatusIdleLabel");
    }
});

const color = computed(() => {
    switch (props.status) {
        case MigrationRunStatus.RUNNING:
            return "primary";
        case MigrationRunStatus.FINISHED:
            return "success";
        case MigrationRunStatus.FAILED:
            return "error";
        default:
            return "grey";
    }
});

const icon = computed(() => {
    switch (props.status) {
        case MigrationRunStatus.RUNNING:
            return "mdi-progress-clock";
        case MigrationRunStatus.FINISHED:
            return "mdi-check-circle-outline";
        case MigrationRunStatus.FAILED:
            return "mdi-alert-circle-outline";
        default:
            return "mdi-sleep";
    }
});
</script>
