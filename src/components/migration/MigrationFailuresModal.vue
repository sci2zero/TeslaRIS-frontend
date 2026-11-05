<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1100"
        scrollable
        @update:model-value="emit('update:modelValue', $event)">
        <v-card>
            <v-card-title>{{ $t("migrationFailuresLabel") }}</v-card-title>
            <v-card-text>
                <div class="text-medium-emphasis mb-4 text-caption">
                    {{ $t("migrationFailuresExplanationMessage", [runId]) }}
                </div>
                <migration-failures-table-component
                    :failures="failures"
                    :total-failures="totalFailures"
                    :page="page"
                    :size="size"
                    @page-change="onPageChange"
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <ui-button variant="outline" @click="emit('update:modelValue', false)">
                    {{ $t("closeLabel") }}
                </ui-button>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { UiButton } from "@/components/ui/button";
import MigrationFailuresTableComponent from "@/components/migration/MigrationFailuresTableComponent.vue";
import MigrationService from "@/services/MigrationService";
import { type MigrationFailureResponse } from "@/models/MigrationModel";
import { getErrorMessageForErrorKey } from "@/i18n";

const props = defineProps<{
    modelValue: boolean;
    runId: string | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    notify: [message: string];
}>();

const failures = ref<MigrationFailureResponse[]>([]);
const totalFailures = ref(0);
const page = ref(0);
const size = ref(10);

const fetchFailures = () => {
    if (!props.runId) {
        return;
    }

    MigrationService.getFailures(props.runId, page.value, size.value).then(response => {
        failures.value = response.data.content;
        totalFailures.value = response.data.totalElements;
    }).catch(error => {
        failures.value = [];
        totalFailures.value = 0;
        emit("notify", getErrorMessageForErrorKey(error.response?.data?.message));
    });
};

watch(() => props.modelValue, (opened) => {
    if (!opened) {
        return;
    }

    page.value = 0;
    fetchFailures();
});

const onPageChange = (options: { page: number; size: number }) => {
    page.value = options.page;
    size.value = options.size;
    fetchFailures();
};
</script>
