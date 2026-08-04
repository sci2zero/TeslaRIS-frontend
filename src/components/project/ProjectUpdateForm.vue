<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model="doi"
                    label="DOI"
                    placeholder="DOI"
                    :rules="doiValidationRules"
                />
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="raid"
                    :label="$t('raidLabel')"
                    :placeholder="$t('raidLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="4">
                <v-select
                    v-model="status"
                    :label="$t('statusLabel')"
                    :items="projectStatusOptions"
                    item-title="title"
                    item-value="value"
                />
            </v-col>
            <v-col cols="4">
                <v-select
                    v-model="collaborationType"
                    :label="$t('collaborationTypeLabel')"
                    :items="projectCollaborationTypeOptions"
                    item-title="title"
                    item-value="value"
                />
            </v-col>
            <v-col cols="4">
                <v-select
                    v-model="researchType"
                    :label="$t('researchTypeLabel')"
                    :items="projectResearchTypeOptions"
                    item-title="title"
                    item-value="value"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="dateFrom"
                    :label="$t('dateFromLabel')"
                    color="primary"
                />
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="dateTo"
                    :label="$t('dateToLabel')"
                    color="primary"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <v-switch
                    v-model="notFunded"
                    :label="$t('notFundedLabel')"
                    color="primary"
                    hide-details
                />
            </v-col>
        </v-row>

        <v-row v-if="!notFunded">
            <v-col>
                <monetary-amount-input
                    ref="costsRef"
                    :preset-amount="props.presetProject?.costs"
                    @update:model-value="costs = $event"
                />
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import UriInput from '@/components/core/UriInput.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { MonetaryAmount } from '@/models/Common';
import { ProjectCollaborationType, ProjectResearchType, ProjectStatus, type Project } from '@/models/ProjectModel';
import { getProjectStatusesForGivenLocale } from '@/i18n/projectStatus';
import { getProjectCollaborationTypesForGivenLocale } from '@/i18n/projectCollaborationType';
import { getProjectResearchTypesForGivenLocale } from '@/i18n/projectResearchType';

const props = defineProps<{
    presetProject: Project | undefined;
}>();

const emit = defineEmits<{
    (e: "update", payload: any): void;
}>();

const isFormValid = ref(false);

const { doiValidationRules } = useValidationUtils();

const urisRef = ref<typeof UriInput>();
const costsRef = ref<typeof MonetaryAmountInput>();

const doi = ref(props.presetProject?.doi);
const raid = ref(props.presetProject?.raid);
const dateFrom = ref(props.presetProject?.dateFrom as string);
const dateTo = ref(props.presetProject?.dateTo as string);
const uris = ref<string[]>(props.presetProject?.uris as string[] ?? []);
const notFunded = ref<boolean>(props.presetProject?.notFunded ?? false);

const status = ref<ProjectStatus>(props.presetProject?.status ?? ProjectStatus.SUBMITTED);
const collaborationType = ref<ProjectCollaborationType>(props.presetProject?.collaborationType ?? ProjectCollaborationType.INTERNAL);
const researchType = ref<ProjectResearchType>(props.presetProject?.researchType ?? ProjectResearchType.FUNDAMENTAL);

const costs = ref<MonetaryAmount | undefined>(props.presetProject?.costs);

const projectStatusOptions = computed(() => getProjectStatusesForGivenLocale());
const projectCollaborationTypeOptions = computed(() => getProjectCollaborationTypesForGivenLocale());
const projectResearchTypeOptions = computed(() => getProjectResearchTypesForGivenLocale());

watch(() => props.presetProject, () => {
    if (props.presetProject) {
        refreshForm();
    }
});

const refreshForm = () => {
    doi.value = props.presetProject?.doi;
    raid.value = props.presetProject?.raid;
    dateFrom.value = props.presetProject?.dateFrom as string;
    dateTo.value = props.presetProject?.dateTo as string;
    notFunded.value = props.presetProject?.notFunded ?? false;
    status.value = props.presetProject?.status ?? ProjectStatus.SUBMITTED;
    collaborationType.value = props.presetProject?.collaborationType ?? ProjectCollaborationType.INTERNAL;
    researchType.value = props.presetProject?.researchType ?? ProjectResearchType.FUNDAMENTAL;
    costsRef.value?.setValue(props.presetProject?.costs);

    urisRef.value?.refreshModelValue(props.presetProject?.uris as string[] ?? []);
    uris.value = props.presetProject?.uris as string[] ?? [];
};

const submit = () => {
    const updatedProject = {
        doi: doi.value,
        raid: raid.value,
        status: status.value,
        collaborationType: collaborationType.value,
        researchType: researchType.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        uris: uris.value,
        notFunded: notFunded.value,
        costs: notFunded.value ? undefined : costs.value
    };

    emit("update", updatedProject);
};

defineExpose({
    submit,
    isFormValid,
    refreshForm
});
</script>
