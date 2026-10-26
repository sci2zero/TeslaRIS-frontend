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

                <div class="context-selector mr-8 mt-4">
                    <v-select
                        v-model="selectedProfileName"
                        :items="profileItems"
                        :label="$t('qualityProfileLabel')"
                        density="comfortable"
                        variant="outlined"
                        hide-details
                    />
                </div>

                <v-btn
                    class="mt-4"
                    color="primary"
                    variant="outlined"
                    :prepend-icon="filtersShown ? 'mdi-filter-off-outline' : 'mdi-filter-outline'"
                    @click="filtersShown = !filtersShown">
                    {{ $t("filtersLabel") }}
                </v-btn>
            </v-card-text>
        </v-card>

        <v-expand-transition>
            <v-card v-show="filtersShown" variant="flat" class="dq-card mb-5">
                <v-card-text>
                    <div class="text-medium-emphasis mb-3 text-caption">
                        {{ $t("fixatorRemarkFilterExplanationMessage") }}
                    </div>

                    <v-row align="center">
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="filters.target"
                                :items="targetOptions"
                                item-title="title"
                                item-value="value"
                                :label="$t('targetEntityTypeLabel')"
                                density="compact"
                                clearable
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="filters.dimension"
                                :items="dimensionOptions"
                                item-title="title"
                                item-value="value"
                                :label="$t('dimensionLabel')"
                                density="compact"
                                clearable
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-select
                                v-model="filters.metric"
                                :items="metricOptions"
                                item-title="title"
                                item-value="value"
                                :label="$t('metricLabel')"
                                density="compact"
                                clearable
                                hide-details
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-btn color="primary" variant="outlined" @click="clearFilters">
                                {{ $t("clearLabel") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-expand-transition>

        <h3 class="fixator-title">
            {{ $t("fixatorPipelinesLabel") }}
        </h3>
        <div class="text-medium-emphasis mb-4 text-caption">
            {{ $t("fixatorPipelinesExplanationMessage") }}
        </div>

        <tab-content-loader v-if="loading" :button-header="false" layout="table" />

        <v-row v-else>
            <v-col v-for="card in cards" :key="card.key" cols="12" md="6">
                <v-card variant="flat" class="dq-card h-100">
                    <v-card-text>
                        <v-form v-model="card.valid">
                            <v-row>
                                <v-col cols="12" md="8">
                                    <v-text-field
                                        v-model="card.form.pipelineName"
                                        :label="$t('pipelineNameLabel')"
                                        :rules="requiredFieldRules"
                                        density="compact"
                                    />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field
                                        :model-value="card.persistedName ? card.form.version : ''"
                                        :label="$t('versionLabel')"
                                        :placeholder="$t('autoAssignedLabel')"
                                        :hint="$t('fixatorVersionHintMessage')"
                                        persistent-placeholder
                                        density="compact"
                                        disabled
                                    />
                                </v-col>
                            </v-row>

                            <v-autocomplete
                                v-model="card.form.matchedRemarkKeys"
                                :items="remarkOptionsFor(card.form.matchedRemarkKeys)"
                                :label="$t('matchedRemarksLabel')"
                                :no-data-text="$t('noMatchingConstraintsMessage')"
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

                    <v-card-actions>
                        <v-btn
                            color="primary"
                            variant="flat"
                            :loading="card.saving"
                            :disabled="!card.form.pipelineName"
                            @click="save(card)">
                            {{ $t("saveLabel") }}
                        </v-btn>
                        <v-spacer />
                        <v-btn color="error" variant="text" @click="requestDelete(card)">
                            {{ $t("deleteLabel") }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card
                    variant="outlined"
                    class="add-pipeline-card h-100 d-flex align-center justify-center"
                    @click="addPipeline">
                    <v-btn color="primary" variant="text" prepend-icon="mdi-plus">
                        {{ $t("addFixatorPipelineLabel") }}
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>

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
import DataQualityService from "@/services/revision/DataQualityService";
import DataQualityFixatorService from "@/services/revision/DataQualityFixatorService";
import { useDataQualityProfiles } from "@/composables/useDataQualityProfiles";
import {
    ISSUE_TARGETS,
    QualityDimension,
    type ConstraintSummary,
    type FixatorPipeline,
    type FixatorSummary,
    type MetricSummary
} from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getQualityDimensionsForGivenLocale } from "@/i18n/qualityDimension";
import { getIssueTargetsForGivenLocale } from "@/i18n/issueTarget";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { getErrorMessageForErrorKey } from "@/i18n";
import { useValidationUtils } from "@/utils/ValidationUtils";


interface PipelineCard {
    key: number;
    // Null until the card is saved, afterwards the name a rename has to be sent against.
    persistedName: string | null;
    form: FixatorPipeline;
    valid: boolean;
    saving: boolean;
}

const i18n = useI18n();
const { profileItems, profileKeys } = useDataQualityProfiles();
const { requiredFieldRules } = useValidationUtils();

const loading = ref(false);
const filtersShown = ref(false);
const snackbar = ref(false);
const message = ref("");

const cards = ref<PipelineCard[]>([]);
const deleteDialog = ref(false);
const cardPendingDeletion = ref<PipelineCard | null>(null);

const selectedProfileName = ref<string | undefined>();
const filters = ref<{
    target?: string; dimension?: QualityDimension; metric?: string;
}>({});

const constraints = ref<ConstraintSummary[]>([]);
const metrics = ref<MetricSummary[]>([]);

const targetOptions = ref(getIssueTargetsForGivenLocale(ISSUE_TARGETS));
const dimensionOptions = ref(getQualityDimensionsForGivenLocale());

const fixators = ref<FixatorSummary[]>([]);

let nextCardKey = 0;

const fixatorOptions = computed(() => fixators.value.map(fixator => {
    const labelKey = `fixator.${fixator.key}`;
    const label = i18n.t(labelKey);

    return { title: label === labelKey ? fixator.name : label, value: fixator.key };
}));

const metricOptions = computed(() => metrics.value.map(metric => ({
    title: displayTextOrPlaceholder(returnCurrentLocaleContent(metric.title) as string),
    value: metric.key
})));

const remarkOptions = computed(() => constraints.value.map(constraint => ({
    title: displayTextOrPlaceholder(returnCurrentLocaleContent(constraint.title) as string),
    value: constraint.key
})));

// A selected remark the active filter rules out stays in the list, otherwise the chip loses its
// title and the next selection drops it.
const remarkOptionsFor = (selectedKeys: string[]) => {
    const options = remarkOptions.value;
    const known = new Set(options.map(option => option.value));

    return [
        ...options,
        ...selectedKeys.filter(key => !known.has(key)).map(key => ({ title: key, value: key }))
    ];
};

const toCard = (pipeline: FixatorPipeline): PipelineCard => ({
    key: nextCardKey++,
    persistedName: pipeline.pipelineName,
    form: {
        pipelineName: pipeline.pipelineName,
        version: pipeline.version,
        matchedRemarkKeys: [...pipeline.matchedRemarkKeys],
        appliedFixators: [...pipeline.appliedFixators],
        createVersionOnEveryStep: pipeline.createVersionOnEveryStep
    },
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

const fetchConstraints = () => {
    if (!selectedProfileName.value) {
        constraints.value = [];
        return;
    }

    DataQualityService.listProfileConstraints(
        selectedProfileName.value, filters.value.target, filters.value.dimension,
        filters.value.metric
    ).then(response => {
        constraints.value = response.data;
    }).catch(() => {
        constraints.value = [];
    });
};

const fetchMetrics = () => {
    if (!selectedProfileName.value) {
        metrics.value = [];
        return;
    }

    DataQualityService.listProfileMetrics(selectedProfileName.value).then(response => {
        metrics.value = response.data;
    }).catch(() => {
        metrics.value = [];
    });
};

const clearFilters = () => {
    filters.value = {};
};

const addPipeline = () => {
    cards.value.push({
        key: nextCardKey++,
        persistedName: null,
        form: {
            pipelineName: "",
            version: null,
            matchedRemarkKeys: [],
            appliedFixators: [],
            createVersionOnEveryStep: false
        },
        valid: false,
        saving: false
    });
};

const notify = (text: string) => {
    message.value = text;
    snackbar.value = true;
};

const save = (card: PipelineCard) => {
    card.saving = true;

    const request = card.persistedName
        ? DataQualityFixatorService.updatePipeline(card.persistedName, card.form)
        : DataQualityFixatorService.createPipeline(card.form);

    request.then(response => {
        Object.assign(card, toCard(response.data), { key: card.key });
        notify(i18n.t("updatedSuccessMessage"));
    }).catch(error => {
        notify(getErrorMessageForErrorKey(error.response?.data?.message));
    }).finally(() => {
        card.saving = false;
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
    targetOptions.value = getIssueTargetsForGivenLocale(ISSUE_TARGETS);
    dimensionOptions.value = getQualityDimensionsForGivenLocale();
});

watch(profileKeys, () => {
    if (!selectedProfileName.value && profileKeys.value.length > 0) {
        selectedProfileName.value = profileKeys.value[0];
    }
}, { immediate: true });

watch(selectedProfileName, () => {
    fetchMetrics();
    fetchConstraints();
}, { immediate: true });

watch(() => [filters.value.target, filters.value.dimension, filters.value.metric],
    fetchConstraints);

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

.context-selector {
    min-width: 260px;
}

.dq-card {
    background-color: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
}

.fixator-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.add-pipeline-card {
    border-style: dashed;
    min-height: 160px;
    cursor: pointer;
}
</style>
