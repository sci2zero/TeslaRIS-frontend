<template>
    <v-container>
        <v-card class="assessment-context-bar mb-5" variant="flat">
            <v-card-text class="d-flex flex-wrap align-center">
                <div class="context-block mr-8">
                    <div class="context-label">
                        {{ $t("assessmentContextLabel") }}
                    </div>
                    <div class="context-value">
                        {{ $t("dataQualityFixatorsLabel") }}
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <v-tabs v-model="currentTab" color="primary" align-tabs="center">
            <v-tab value="pipelines">
                {{ $t("fixatorPipelinesLabel") }}
            </v-tab>
            <v-tab value="scheduledTasks">
                {{ $t("scheduleTasksLabel") }}
            </v-tab>
        </v-tabs>

        <div v-if="currentTab === 'pipelines'" class="mt-4">
            <div class="text-medium-emphasis mb-4 text-caption">
                {{ $t("fixatorPipelinesExplanationMessage") }}
            </div>

            <tab-content-loader v-if="loading" :button-header="false" layout="table" />

            <template v-else>
                <v-tabs
                    v-model="currentProfile"
                    color="primary"
                    density="compact"
                    show-arrows
                    class="mb-4">
                    <v-tab
                        v-for="profileName in profileKeys"
                        :key="profileName"
                        :value="profileName">
                        {{ profileLabel(profileName) }}
                    </v-tab>
                </v-tabs>

                <v-row>
                    <v-col
                        v-for="card in cardsFor(currentProfile)"
                        :key="card.key"
                        cols="12"
                        md="6">
                        <v-card variant="flat" rounded="lg" class="dq-card h-100">
                            <v-card-item>
                                <template #prepend>
                                    <v-avatar
                                        color="primary"
                                        variant="tonal"
                                        icon="mdi-auto-fix"
                                    />
                                </template>
                                <v-card-title>
                                    {{ displayTextOrPlaceholder(card.form.pipelineName) }}
                                </v-card-title>
                                <v-card-subtitle>
                                    {{ $t("versionLabel") }}:
                                    {{ card.persistedName
                                        ? card.form.version
                                        : $t("autoAssignedLabel") }}
                                </v-card-subtitle>
                                <template #append>
                                    <v-btn
                                        variant="text"
                                        density="comfortable"
                                        :icon="card.filtersShown
                                            ? 'mdi-filter-off-outline'
                                            : 'mdi-filter-outline'"
                                        @click="card.filtersShown = !card.filtersShown"
                                    />
                                </template>
                            </v-card-item>

                            <v-divider />

                            <v-card-text>
                                <v-form v-model="card.valid">
                                    <v-text-field
                                        v-model="card.form.pipelineName"
                                        :label="$t('pipelineNameLabel')"
                                        :rules="requiredFieldRules"
                                        density="compact"
                                    />

                                    <v-expand-transition>
                                        <div v-show="card.filtersShown">
                                            <div
                                                class="text-medium-emphasis mb-2 text-caption">
                                                {{ $t(
                                                    "fixatorRemarkFilterExplanationMessage") }}
                                            </div>

                                            <v-row dense>
                                                <v-col cols="12" md="4">
                                                    <v-select
                                                        v-model="card.filters.target"
                                                        :items="targetOptionsFor(currentProfile)"
                                                        :label="$t('targetEntityTypeLabel')"
                                                        density="compact"
                                                        clearable
                                                        hide-details
                                                    />
                                                </v-col>
                                                <v-col cols="12" md="4">
                                                    <v-select
                                                        v-model="card.filters.dimension"
                                                        :items="dimensionOptionsFor(currentProfile)"
                                                        :label="$t('dimensionLabel')"
                                                        density="compact"
                                                        clearable
                                                        hide-details
                                                    />
                                                </v-col>
                                                <v-col cols="12" md="4">
                                                    <v-select
                                                        v-model="card.filters.metric"
                                                        :items="metricOptionsFor(currentProfile)"
                                                        :label="$t('metricLabel')"
                                                        density="compact"
                                                        clearable
                                                        hide-details
                                                    />
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-expand-transition>

                                    <v-autocomplete
                                        v-model="card.form.matchedRemarkKeys"
                                        :items="remarkOptionsFor(card)"
                                        :label="$t('matchedRemarksLabel')"
                                        :no-data-text="$t('noMatchingConstraintsMessage')"
                                        class="mt-4"
                                        density="compact"
                                        multiple
                                        chips
                                        closable-chips
                                        clearable
                                        auto-select-first
                                    />

                                    <v-select
                                        v-model="card.form.appliedFixators"
                                        :items="fixatorOptions"
                                        :label="$t('appliedFixatorsLabel')"
                                        :no-data-text="$t('noFixatorsConfiguredMessage')"
                                        density="compact"
                                        multiple
                                        chips
                                        closable-chips
                                        clearable
                                    />

                                    <v-switch
                                        v-model="card.form.createVersionOnEveryStep"
                                        :label="$t('createVersionOnEveryStepLabel')"
                                        color="primary"
                                        density="compact"
                                        hide-details
                                    />
                                </v-form>
                            </v-card-text>

                            <v-divider />

                            <v-card-actions>
                                <v-btn
                                    color="primary"
                                    variant="flat"
                                    :loading="card.saving"
                                    :disabled="!canSave(card)"
                                    @click="save(card)">
                                    {{ $t("saveLabel") }}
                                </v-btn>
                                <v-btn
                                    color="primary"
                                    variant="text"
                                    prepend-icon="mdi-calendar-plus"
                                    :disabled="!canSchedule(card)"
                                    @click="requestRun(card)">
                                    {{ $t("scheduleLabel") }}
                                </v-btn>
                                <v-spacer />
                                <v-btn
                                    color="error"
                                    variant="text"
                                    @click="requestDelete(card)">
                                    {{ $t("deleteLabel") }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>

                    <v-col v-if="cardsFor(currentProfile).length === 0" cols="12">
                        <div class="text-medium-emphasis text-caption">
                            {{ $t("noDataInTableMessage") }}
                        </div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-card
                            variant="flat"
                            rounded="lg"
                            class="add-pipeline-card h-100"
                            @click="addPipeline(currentProfile)">
                            <div class="add-pipeline-body">
                                <div class="add-pipeline-circle">
                                    <v-icon icon="mdi-plus" size="44" />
                                </div>
                                <div class="add-pipeline-label mt-4">
                                    {{ $t("addFixatorPipelineLabel") }}
                                </div>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </template>
        </div>

        <div v-else class="mt-4">
            <scheduled-tasks-list
                :scheduled-tasks="scheduledTasks"
                @delete="cancelScheduledTask"
            />
        </div>

        <v-dialog v-model="runDialog" max-width="520">
            <v-card>
                <v-card-title>{{ $t("scheduleLabel") }}</v-card-title>
                <v-card-text>
                    <div class="text-medium-emphasis mb-4 text-caption">
                        {{ $t("scheduleFixatorRunExplanationMessage",
                              [cardPendingRun?.form.pipelineName]) }}
                    </div>
                    <v-row>
                        <v-col cols="12" md="6">
                            <date-picker
                                v-model="runDate"
                                :label="$t('dateLabel') + '*'"
                                color="primary"
                                required
                                in-future
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <time-picker v-model="runTime" :label="$t('timeLabel')" required />
                        </v-col>
                    </v-row>
                    <v-select
                        v-model="runRecurrence"
                        :items="recurrenceOptions"
                        :label="$t('recurrenceTypeLabel')"
                        density="compact"
                        hide-details
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="runDialog = false">
                        {{ $t("cancelLabel") }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        variant="flat"
                        :loading="scheduling"
                        @click="confirmRun">
                        {{ $t("scheduleLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="480">
            <v-card>
                <v-card-title>{{ $t("deleteLabel") }}</v-card-title>
                <v-card-text>
                    {{ $t("deleteFixatorPipelineConfirmationMessage",
                          [cardPendingDeletion?.form.pipelineName]) }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="deleteDialog = false">
                        {{ $t("cancelLabel") }}
                    </v-btn>
                    <v-btn color="error" variant="flat" @click="confirmDelete">
                        {{ $t("deleteLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <toast v-model="snackbar" :message="message" />
    </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import Toast from "@/components/core/Toast.vue";
import DatePicker from "@/components/core/DatePicker.vue";
import TimePicker from "@/components/core/TimePicker.vue";
import ScheduledTasksList from "@/components/core/ScheduledTasksList.vue";
import DataQualityService from "@/services/revision/DataQualityService";
import DataQualityFixatorService from "@/services/revision/DataQualityFixatorService";
import TaskManagerService from "@/services/TaskManagerService";
import { useDataQualityProfiles } from "@/composables/useDataQualityProfiles";
import {
    QualityDimension,
    type ConstraintSummary,
    type FixatorPipeline,
    type FixatorSummary,
    type MetricSummary
} from "@/models/RevisionModel";
import { type ScheduledTaskResponse } from "@/models/Common";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getQualityDimensionTitleFromValueAutoLocale } from "@/i18n/qualityDimension";
import { getIssueTargetTitleFromValueAutoLocale } from "@/i18n/issueTarget";
import { getRecurrenceTypesForGivenLocale } from "@/i18n/recurrenceType";
import { RecurrenceType } from "@/models/LoadModel";
import { DateTime } from "luxon";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { getErrorMessageForErrorKey } from "@/i18n";
import { useValidationUtils } from "@/utils/ValidationUtils";


interface CardFilters {
    target?: string;
    dimension?: QualityDimension;
    metric?: string;
}

interface PipelineCard {
    key: number;
    // Null until the card is saved, afterwards the name a rename has to be sent against.
    persistedName: string | null;
    form: FixatorPipeline;
    filters: CardFilters;
    filtersShown: boolean;
    valid: boolean;
    saving: boolean;
}

const i18n = useI18n();
const { profileKeys, profileLabel } = useDataQualityProfiles();
const { requiredFieldRules } = useValidationUtils();

const loading = ref(false);
const snackbar = ref(false);
const message = ref("");

const currentTab = ref("pipelines");
const currentProfile = ref("");

const cards = ref<PipelineCard[]>([]);
const deleteDialog = ref(false);
const cardPendingDeletion = ref<PipelineCard | null>(null);

const runDialog = ref(false);
const cardPendingRun = ref<PipelineCard | null>(null);
const scheduling = ref(false);
const runRecurrence = ref<RecurrenceType>(RecurrenceType.ONCE);
const runDate = ref("");
const runTime = ref("");

const recurrenceOptions = ref(getRecurrenceTypesForGivenLocale());
const scheduledTasks = ref<ScheduledTaskResponse[]>([]);

const constraintsByProfile = ref<Record<string, ConstraintSummary[]>>({});
const metricsByProfile = ref<Record<string, MetricSummary[]>>({});

const fixators = ref<FixatorSummary[]>([]);

let nextCardKey = 0;

const fixatorOptions = computed(() => fixators.value.map(fixator => {
    const labelKey = `fixator.${fixator.key}`;
    const label = i18n.t(labelKey);

    return { title: label === labelKey ? fixator.name : label, value: fixator.key };
}));

const constraintsOf = (profileName: string) => constraintsByProfile.value[profileName] ?? [];

const cardsFor = (profileName: string) =>
    cards.value.filter(card =>
        card.form.profileName?.toLowerCase() === profileName?.toLowerCase());

// A target is a family and an optional path below it, and the filter matches the family.
const targetOptionsFor = (profileName: string) => {
    const families = new Set(constraintsOf(profileName)
        .map(constraint => constraint.target?.split(".")[0])
        .filter((family): family is string => !!family));

    return [...families].sort().map(family => ({
        title: getIssueTargetTitleFromValueAutoLocale(family) as string,
        value: family
    }));
};

const dimensionOptionsFor = (profileName: string) => {
    const dimensions = new Set(constraintsOf(profileName)
        .map(constraint => constraint.dimension)
        .filter((dimension): dimension is QualityDimension => !!dimension));

    return [...dimensions].sort().map(dimension => ({
        title: getQualityDimensionTitleFromValueAutoLocale(dimension) as string,
        value: dimension
    }));
};

const metricOptionsFor = (profileName: string) => {
    const titles = new Map((metricsByProfile.value[profileName] ?? []).map(metric => [
        metric.key,
        displayTextOrPlaceholder(returnCurrentLocaleContent(metric.title) as string)
    ]));
    const used = new Set(constraintsOf(profileName)
        .map(constraint => constraint.metric)
        .filter((metric): metric is string => !!metric));

    return [...used].sort().map(metric => ({
        title: titles.get(metric) ?? metric,
        value: metric
    }));
};

// A selected remark that the card filter rules out stays in the list, otherwise the chip loses
// its title and the next selection drops it.
const remarkOptionsFor = (card: PipelineCard) => {
    const filters = card.filters;
    const options = constraintsOf(card.form.profileName)
        .filter(constraint =>
            (!filters.target || !!constraint.target?.startsWith(filters.target)) &&
            (!filters.dimension || constraint.dimension === filters.dimension) &&
            (!filters.metric || constraint.metric === filters.metric))
        .map(constraint => ({
            title: displayTextOrPlaceholder(
                returnCurrentLocaleContent(constraint.title) as string),
            value: constraint.key
        }));
    const known = new Set(options.map(option => option.value));

    return [
        ...options,
        ...card.form.matchedRemarkKeys.filter(key => !known.has(key))
            .map(key => ({ title: key, value: key }))
    ];
};

const toCard = (pipeline: FixatorPipeline): PipelineCard => ({
    key: nextCardKey++,
    persistedName: pipeline.pipelineName,
    form: {
        pipelineName: pipeline.pipelineName,
        profileName: pipeline.profileName,
        version: pipeline.version,
        matchedRemarkKeys: [...pipeline.matchedRemarkKeys],
        appliedFixators: [...pipeline.appliedFixators],
        createVersionOnEveryStep: pipeline.createVersionOnEveryStep
    },
    filters: {},
    filtersShown: false,
    valid: true,
    saving: false
});

const fetchPipelines = () => {
    loading.value = true;

    DataQualityFixatorService.listPipelines().then(response => {
        cards.value = response.data.map(toCard);
    }).catch(() => {
        cards.value = [];
    }).finally(() => {
        loading.value = false;
    });
};

const fetchFixators = () => {
    DataQualityFixatorService.listFixators().then(response => {
        fixators.value = response.data;
    }).catch(() => {
        fixators.value = [];
    });
};

// A profile does not change while the application runs, thus it is read one time and the cards
// filter it in memory.
const loadProfileData = (profileName: string) => {
    if (!profileName || profileName in constraintsByProfile.value) {
        return;
    }

    constraintsByProfile.value[profileName] = [];

    DataQualityService.listProfileConstraints(
        profileName, undefined, undefined, undefined
    ).then(response => {
        constraintsByProfile.value[profileName] = response.data;
    }).catch(() => {
        constraintsByProfile.value[profileName] = [];
    });

    DataQualityService.listProfileMetrics(profileName).then(response => {
        metricsByProfile.value[profileName] = response.data;
    }).catch(() => {
        metricsByProfile.value[profileName] = [];
    });
};

const fetchScheduledTasks = () => {
    TaskManagerService.listScheduledDataQualityFixTasks().then(response => {
        scheduledTasks.value = response.data;
    }).catch(() => {
        scheduledTasks.value = [];
    });
};

const notify = (text: string) => {
    message.value = text;
    snackbar.value = true;
};

const cancelScheduledTask = (taskId: string) => {
    TaskManagerService.canceltask(taskId).then(() => {
        notify(i18n.t("deleteSuccessNotification", { name: taskId }));
        fetchScheduledTasks();
    }).catch(error => {
        notify(getErrorMessageForErrorKey(error.response?.data?.message));
    });
};

const addPipeline = (profileName: string) => {
    cards.value.push({
        key: nextCardKey++,
        persistedName: null,
        form: {
            pipelineName: "",
            profileName,
            version: null,
            matchedRemarkKeys: [],
            appliedFixators: [],
            createVersionOnEveryStep: false
        },
        filters: {},
        filtersShown: false,
        valid: false,
        saving: false
    });
};

// A pipeline that matches no remark key is never run, thus it cannot be saved either.
const canSave = (card: PipelineCard) =>
    Boolean(card.form.pipelineName) && card.form.matchedRemarkKeys.length > 0;

const canSchedule = (card: PipelineCard) =>
    Boolean(card.persistedName) && card.form.matchedRemarkKeys.length > 0;

const save = (card: PipelineCard) => {
    card.saving = true;

    const request = card.persistedName
        ? DataQualityFixatorService.updatePipeline(card.persistedName, card.form)
        : DataQualityFixatorService.createPipeline(card.form);

    request.then(response => {
        Object.assign(card, toCard(response.data), {
            key: card.key,
            filters: card.filters,
            filtersShown: card.filtersShown
        });
        notify(i18n.t("updatedSuccessMessage"));
    }).catch(error => {
        notify(getErrorMessageForErrorKey(error.response?.data?.message));
    }).finally(() => {
        card.saving = false;
    });
};

const requestRun = (card: PipelineCard) => {
    const inFiveMinutes = DateTime.local().plus({ minutes: 5 });

    runDate.value = inFiveMinutes.toISODate() as string;
    runTime.value = inFiveMinutes.toFormat("HH:mm");
    runRecurrence.value = RecurrenceType.ONCE;
    cardPendingRun.value = card;
    runDialog.value = true;
};

const confirmRun = () => {
    const card = cardPendingRun.value;

    if (!card?.persistedName || !runDate.value || !runTime.value) {
        return;
    }

    scheduling.value = true;

    DataQualityFixatorService.scheduleFixatorRun(card.persistedName,
        `${runDate.value.split("T")[0]}T${runTime.value}:00`, runRecurrence.value
    ).then(() => {
        notify(i18n.t("scheduleSuccessMessage"));
        fetchScheduledTasks();
    }).catch(error => {
        notify(getErrorMessageForErrorKey(error.response?.data?.message));
    }).finally(() => {
        scheduling.value = false;
        runDialog.value = false;
        cardPendingRun.value = null;
    });
};

const requestDelete = (card: PipelineCard) => {
    if (!card.persistedName) {
        cards.value = cards.value.filter(candidate => candidate.key !== card.key);
        return;
    }

    cardPendingDeletion.value = card;
    deleteDialog.value = true;
};

const confirmDelete = () => {
    const card = cardPendingDeletion.value;

    if (!card?.persistedName) {
        return;
    }

    DataQualityFixatorService.deletePipeline(card.persistedName).then(() => {
        cards.value = cards.value.filter(candidate => candidate.key !== card.key);
        notify(i18n.t("deleteSuccessNotification", { name: card.persistedName }));
    }).catch(error => {
        notify(getErrorMessageForErrorKey(error.response?.data?.message));
    }).finally(() => {
        deleteDialog.value = false;
        cardPendingDeletion.value = null;
    });
};

watch(i18n.locale, () => {
    recurrenceOptions.value = getRecurrenceTypesForGivenLocale();
});

watch(profileKeys, keys => {
    if (!currentProfile.value && keys.length > 0) {
        currentProfile.value = keys[0];
    }
}, { immediate: true });

watch(currentProfile, loadProfileData, { immediate: true });

watch(currentTab, tab => {
    if (tab === "scheduledTasks") {
        fetchScheduledTasks();
    }
});

fetchFixators();
fetchPipelines();
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

.dq-card {
    background-color: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
}

.add-pipeline-card {
    background-color: rgb(var(--v-theme-surface));
    border: 2px dashed rgba(var(--v-border-color), 0.25);
    cursor: pointer;
    display: flex;
    min-height: 240px;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.add-pipeline-card:hover {
    border-color: rgba(var(--v-theme-primary), 0.6);
    background-color: rgba(var(--v-theme-primary), 0.04);
}

.add-pipeline-body {
    align-items: center;
    color: rgb(var(--v-theme-primary));
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    justify-content: center;
    min-height: 240px;
    padding: 1.5rem;
    text-align: center;
}

.add-pipeline-circle {
    align-items: center;
    border: 2px solid rgba(var(--v-theme-primary), 0.35);
    border-radius: 50%;
    display: flex;
    height: 88px;
    justify-content: center;
    width: 88px;
}

.add-pipeline-label {
    font-weight: 600;
    letter-spacing: 0.02em;
}
</style>
