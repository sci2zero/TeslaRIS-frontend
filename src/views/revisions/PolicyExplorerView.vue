<template>
    <v-container>
        <v-card class="assessment-context-bar mb-5" variant="flat">
            <v-card-text class="d-flex flex-wrap align-center">
                <div class="context-block mr-8">
                    <div class="context-label">
                        {{ $t("assessmentContextLabel") }}
                    </div>
                    <div class="context-value">
                        {{ $t("dataGovernanceQualityPolicyLabel") }}
                        <span v-if="policy" class="text-medium-emphasis">
                            v{{ policy.version }}
                        </span>
                    </div>
                </div>

                <div class="context-selector mr-8">
                    <v-select
                        v-model="selectedProfileName"
                        :items="profileNames"
                        :label="$t('qualityProfileLabel')"
                        density="comfortable"
                        variant="outlined"
                        hide-details
                    />
                </div>

                <div class="context-selector">
                    <date-picker
                        v-model="selectedAssessmentDate"
                        :label="$t('assessmentDateLabel')"
                        color="primary"
                    />
                </div>
            </v-card-text>
        </v-card>

        <h3 class="explorer-title">
            {{ $t("policyExplorerLabel") }}
        </h3>

        <v-card variant="flat" class="dq-card mb-5">
            <v-card-text>
                <v-row align="center">
                    <v-col cols="12" md="2">
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
                            v-model="filters.target"
                            :items="targetOptions"
                            item-title="title"
                            item-value="value"
                            :label="$t('targetObjectLabel')"
                            density="compact"
                            clearable
                            hide-details
                        />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-select
                            v-model="filters.severity"
                            :items="severityOptions"
                            item-title="title"
                            item-value="value"
                            :label="$t('severityLabel')"
                            density="compact"
                            clearable
                            hide-details
                        />
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field
                            v-model="filters.search"
                            :label="$t('searchConstraintsLabel')"
                            density="compact"
                            clearable
                            hide-details
                        />
                    </v-col>
                    <v-col cols="12" md="2" class="d-flex gap-2">
                        <v-btn color="primary" variant="outlined" @click="clearFilters">
                            {{ $t("clearLabel") }}
                        </v-btn>
                        <v-btn
                            color="primary"
                            variant="text"
                            prepend-icon="mdi-refresh"
                            :disabled="loading"
                            @click="fetchPolicy">
                            {{ $t("refreshLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <tab-content-loader v-if="loading" :button-header="false" layout="table" />

        <v-card v-else variant="flat" class="dq-card">
            <v-card-text>
                <div v-if="filteredConstraints.length === 0" class="text-medium-emphasis">
                    {{ $t("noMatchingConstraintsMessage") }}
                </div>

                <template v-else>
                    <v-table density="compact">
                        <thead>
                            <tr>
                                <th>{{ $t("constraintLabel") }}</th>
                                <th>{{ $t("dimensionLabel") }}</th>
                                <th>{{ $t("targetObjectLabel") }}</th>
                                <th>{{ $t("severityLabel") }}</th>
                                <th>{{ $t("affectedRecordsLabel") }}</th>
                                <th>{{ $t("actionLabel") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="constraint in pagedConstraints" :key="constraint.key">
                                <td class="py-2">
                                    <div class="context-value">
                                        {{ titleOf(constraint) }}
                                    </div>
                                    <a class="details-link" @click="showConstraintDetails(constraint)">
                                        {{ $t("viewConstraintDetailsLabel") }}
                                    </a>
                                </td>
                                <td class="py-2">
                                    <div class="context-value">
                                        {{ getQualityDimensionTitleFromValueAutoLocale(constraint.dimension) }}
                                    </div>
                                    <a class="details-link" @click="showDimensionDetails(constraint.dimension)">
                                        {{ $t("viewDimensionDetailsLabel") }}
                                    </a>
                                </td>
                                <td>{{ constraint.target }}</td>
                                <td>
                                    <v-chip
                                        :color="severityColors[constraint.severity]"
                                        variant="tonal"
                                        size="small">
                                        {{ getIssueSeverityTitleFromValueAutoLocale(constraint.severity) }}
                                    </v-chip>
                                </td>
                                <td class="font-weight-bold">
                                    {{ constraint.affectedRecords }}
                                </td>
                                <td>
                                    <v-btn
                                        :disabled="constraint.affectedRecords === 0"
                                        density="compact"
                                        variant="text"
                                        color="primary"
                                        append-icon="mdi-arrow-right"
                                        @click="openIssues(constraint)">
                                        {{ $t("openIssuesLabel") }}
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>

                    <div class="d-flex align-center justify-space-between mt-4">
                        <span class="text-medium-emphasis text-caption">
                            {{ $t("showingConstraintsMessage", {
                                from: pageStart, to: pageEnd, total: filteredConstraints.length
                            }) }}
                        </span>
                        <v-pagination
                            v-model="page"
                            :length="pageCount"
                            :total-visible="5"
                            density="comfortable"
                        />
                    </div>
                </template>
            </v-card-text>
        </v-card>

        <v-dialog v-model="constraintDialog" max-width="640">
            <v-card v-if="selectedConstraint">
                <v-card-title>{{ titleOf(selectedConstraint) }}</v-card-title>
                <v-card-text>
                    <v-table density="compact">
                        <tbody>
                            <tr>
                                <td class="text-medium-emphasis">
                                    {{ $t("targetObjectLabel") }}
                                </td>
                                <td>{{ selectedConstraint.target }}</td>
                            </tr>
                            <tr>
                                <td class="text-medium-emphasis">
                                    {{ $t("dimensionLabel") }}
                                </td>
                                <td>
                                    {{ getQualityDimensionTitleFromValueAutoLocale(selectedConstraint.dimension) }}
                                </td>
                            </tr>
                            <tr>
                                <td class="text-medium-emphasis">
                                    {{ $t("severityLabel") }}
                                </td>
                                <td>
                                    {{ getIssueSeverityTitleFromValueAutoLocale(selectedConstraint.severity) }}
                                </td>
                            </tr>
                            <tr>
                                <td class="text-medium-emphasis">
                                    {{ $t("blockingLabel") }}
                                </td>
                                <td>{{ selectedConstraint.blocking ? $t("yesLabel") : $t("noLabel") }}</td>
                            </tr>
                            <tr>
                                <td class="text-medium-emphasis">
                                    {{ $t("pointsLabel") }}
                                </td>
                                <td>{{ selectedConstraint.points }}</td>
                            </tr>
                            <tr>
                                <td class="text-medium-emphasis">
                                    {{ $t("targetWeightLabel") }}
                                </td>
                                <td>{{ selectedConstraint.targetWeight }}</td>
                            </tr>
                            <tr>
                                <td class="text-medium-emphasis">
                                    {{ $t("fairComplianceLabel") }}
                                </td>
                                <td>
                                    {{ selectedConstraint.usedForFairCompliance ? $t("yesLabel") : $t("noLabel") }}
                                </td>
                            </tr>
                            <tr v-for="(value, name) in selectedConstraint.constraints" :key="name">
                                <td class="text-medium-emphasis">
                                    {{ name }}
                                </td>
                                <td>{{ value }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="constraintDialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dimensionDialog" max-width="560">
            <v-card v-if="selectedDimension">
                <v-card-title>
                    {{ getQualityDimensionTitleFromValueAutoLocale(selectedDimension) }}
                </v-card-title>
                <v-card-text>
                    {{ displayTextOrPlaceholder(dimensionDefinition) }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="dimensionDialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from "vue-router";
import DatePicker from "@/components/core/DatePicker.vue";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import DataQualityService from "@/services/revision/DataQualityService";
import {
    ISSUE_TARGETS,
    IssueSeverity,
    QualityDimension,
    SEVERITY_COLORS,
    type PolicyConstraint,
    type PolicyExplorer
} from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import {
    getQualityDimensionsForGivenLocale,
    getQualityDimensionTitleFromValueAutoLocale
} from "@/i18n/qualityDimension";
import {
    getIssueSeveritiesForGivenLocale,
    getIssueSeverityTitleFromValueAutoLocale
} from "@/i18n/issueSeverity";
import { getIssueTargetsForGivenLocale } from "@/i18n/issueTarget";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";


const PAGE_SIZE = 5;

interface PolicyFilters {
    dimension?: QualityDimension;
    target?: string;
    severity?: IssueSeverity;
    search?: string;
}

interface ExplorerState {
    profile?: string;
    date?: string;
    page: number;
    filters: PolicyFilters;
}

const single = (value: LocationQuery[string]): string | undefined => {
    const first = Array.isArray(value) ? value[0] : value;

    return first ? String(first) : undefined;
};

const oneOf = <T extends string>(value: string | undefined, allowed: readonly T[]) =>
    allowed.includes(value as T) ? value as T : undefined;

const parseQuery = (query: LocationQuery): ExplorerState => ({
    profile: single(query.profile),
    date: single(query.date),
    page: Math.max(1, parseInt(single(query.page) ?? "1") || 1),
    filters: {
        dimension: oneOf(single(query.dimension), Object.values(QualityDimension)),
        target: oneOf(single(query.target), ISSUE_TARGETS),
        severity: oneOf(single(query.severity), Object.values(IssueSeverity)),
        search: single(query.search)
    }
});

const toQuery = (state: ExplorerState): LocationQueryRaw => {
    const query: LocationQueryRaw = {};

    if (state.profile) {
        query.profile = state.profile;
    }

    if (state.date) {
        query.date = state.date.split("T")[0];
    }

    if (state.filters.dimension) {
        query.dimension = state.filters.dimension;
    }

    if (state.filters.target) {
        query.target = state.filters.target;
    }

    if (state.filters.severity) {
        query.severity = state.filters.severity;
    }

    if (state.filters.search) {
        query.search = state.filters.search;
    }

    if (state.page > 1) {
        query.page = `${state.page}`;
    }

    return query;
};

const serialise = (query: LocationQueryRaw) => new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)])).toString();

export default defineComponent({
    name: "PolicyExplorerView",
    components: { DatePicker, TabContentLoader },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const i18n = useI18n();

        const initialState = parseQuery(route.query);

        const profileNames = ref<string[]>([]);
        const selectedProfileName = ref<string | undefined>(initialState.profile);
        const selectedAssessmentDate = ref<string | undefined>(initialState.date);

        const policy = ref<PolicyExplorer | undefined>(undefined);
        const loading = ref(false);
        const page = ref(initialState.page);
        const filters = ref<PolicyFilters>({ ...initialState.filters });

        const constraintDialog = ref(false);
        const selectedConstraint = ref<PolicyConstraint | undefined>(undefined);
        const dimensionDialog = ref(false);
        const selectedDimension = ref<QualityDimension | undefined>(undefined);

        const dimensionOptions = computed(() => getQualityDimensionsForGivenLocale());
        const severityOptions = computed(() => getIssueSeveritiesForGivenLocale());
        const targetOptions = computed(() => getIssueTargetsForGivenLocale(ISSUE_TARGETS));

        const titleOf = (constraint: PolicyConstraint) =>
            displayTextOrPlaceholder(returnCurrentLocaleContent(constraint.title) as string);

        const filteredConstraints = computed(() => {
            const search = filters.value.search?.trim().toLowerCase();

            return (policy.value?.constraints ?? []).filter(constraint => {
                if (filters.value.dimension && constraint.dimension !== filters.value.dimension) {
                    return false;
                }

                if (filters.value.severity && constraint.severity !== filters.value.severity) {
                    return false;
                }

                // The target of a rule is a family and a field, so a filter on the family matches
                // every rule under it.
                if (filters.value.target &&
                    !(constraint.target ?? "").startsWith(filters.value.target)) {
                    return false;
                }

                if (search) {
                    return constraint.key.toLowerCase().includes(search) ||
                        titleOf(constraint).toLowerCase().includes(search);
                }

                return true;
            });
        });

        const pageCount = computed(() =>
            Math.max(1, Math.ceil(filteredConstraints.value.length / PAGE_SIZE)));

        const pagedConstraints = computed(() =>
            filteredConstraints.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));

        const pageStart = computed(() =>
            filteredConstraints.value.length === 0 ? 0 : (page.value - 1) * PAGE_SIZE + 1);

        const pageEnd = computed(() =>
            Math.min(page.value * PAGE_SIZE, filteredConstraints.value.length));

        const dimensionDefinition = computed(() => selectedDimension.value
            ? returnCurrentLocaleContent(
                policy.value?.dimensionDefinitions?.[selectedDimension.value] ?? []) as string
            : "");

        const currentState = (): ExplorerState => ({
            profile: selectedProfileName.value,
            date: selectedAssessmentDate.value || undefined,
            page: page.value,
            filters: filters.value
        });

        const mirrorToUrl = () => {
            const query = toQuery(currentState());

            if (serialise(query) !== serialise(route.query as LocationQueryRaw)) {
                router.replace({ query });
            }
        };

        const fetchPolicy = () => {
            if (!selectedProfileName.value) {
                return;
            }

            loading.value = true;

            DataQualityService.getPolicy(
                selectedProfileName.value, selectedAssessmentDate.value
            ).then(response => {
                policy.value = response.data;
            }).finally(() => {
                loading.value = false;
            });
        };

        const clearFilters = () => {
            filters.value = {};
        };

        const showConstraintDetails = (constraint: PolicyConstraint) => {
            selectedConstraint.value = constraint;
            constraintDialog.value = true;
        };

        const showDimensionDetails = (dimension: QualityDimension) => {
            selectedDimension.value = dimension;
            dimensionDialog.value = true;
        };

        const openIssues = (constraint: PolicyConstraint) => {
            const query: LocationQueryRaw = { constraint: constraint.key };

            if (selectedProfileName.value) {
                query.profile = selectedProfileName.value;
            }

            if (selectedAssessmentDate.value) {
                query.date = selectedAssessmentDate.value.split("T")[0];
            }

            router.push({ name: "issueExplorer", query });
        };

        watch(filters, () => {
            page.value = 1;
            mirrorToUrl();
        }, { deep: true });

        watch(page, mirrorToUrl);

        watch([selectedProfileName, selectedAssessmentDate], () => {
            mirrorToUrl();
            fetchPolicy();
        });

        watch(() => route.query, query => {
            const state = parseQuery(query);

            if (serialise(toQuery(state)) === serialise(toQuery(currentState()))) {
                return;
            }

            selectedProfileName.value = state.profile ?? selectedProfileName.value;
            selectedAssessmentDate.value = state.date;
            filters.value = { ...state.filters };
            page.value = state.page;
        });

        // A filter can shrink the list under the current page.
        watch(pageCount, count => {
            if (page.value > count) {
                page.value = count;
            }
        });

        onMounted(() => {
            document.title = i18n.t("routeLabel.policyExplorer");

            DataQualityService.listProfileNames().then(response => {
                profileNames.value = [
                    ...new Set(response.data.map(profile => profile.profileName))
                ];

                if (!selectedProfileName.value ||
                    !profileNames.value.includes(selectedProfileName.value)) {
                    selectedProfileName.value = profileNames.value[0];
                } else {
                    fetchPolicy();
                }
            });
        });

        return {
            profileNames, selectedProfileName, selectedAssessmentDate,
            policy, loading, page, filters,
            dimensionOptions, severityOptions, targetOptions,
            filteredConstraints, pagedConstraints, pageCount, pageStart, pageEnd,
            constraintDialog, selectedConstraint, dimensionDialog, selectedDimension,
            dimensionDefinition,
            severityColors: SEVERITY_COLORS,
            titleOf, clearFilters, fetchPolicy, showConstraintDetails, showDimensionDetails,
            openIssues,
            getQualityDimensionTitleFromValueAutoLocale, getIssueSeverityTitleFromValueAutoLocale,
            displayTextOrPlaceholder
        };
    }
});
</script>

<style scoped>
.assessment-context-bar {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}

.context-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.75rem;
}

.context-value {
    font-size: 0.95rem;
    font-weight: 600;
}

.context-selector {
    min-width: 240px;
}

.explorer-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 8px;
}

.dq-card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}

.details-link {
    color: rgb(var(--v-theme-primary));
    cursor: pointer;
    font-size: 0.8rem;
}
</style>
