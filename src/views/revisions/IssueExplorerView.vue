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

        <data-quality-issues-table
            ref="issuesTable"
            :profile-name="selectedProfileName"
            :assessment-date="selectedAssessmentDate"
            :initial-filters="initialFilters"
            @update:filters="onFiltersChanged"
        />
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from "vue-router";
import DatePicker from "@/components/core/DatePicker.vue";
import DataQualityService from "@/services/revision/DataQualityService";
import DataQualityIssuesTable from "@/components/core/revisions/DataQualityIssuesTable.vue";
import {
    ISSUE_TARGETS,
    IssueSeverity,
    QualityDimension,
    type IssueFilters
} from "@/models/RevisionModel";


interface ExplorerState {
    profile?: string;
    date?: string;
    filters: IssueFilters;
}

const single = (value: LocationQuery[string]): string | undefined => {
    const first = Array.isArray(value) ? value[0] : value;

    return first ? String(first) : undefined;
};

const oneOf = <T extends string>(value: string | undefined, allowed: readonly T[]) =>
    allowed.includes(value as T) ? value as T : undefined;

// Unknown values are dropped rather than rejected, so a stale link still opens the page.
const parseQuery = (query: LocationQuery): ExplorerState => ({
    profile: single(query.profile),
    date: single(query.date),
    filters: {
        target: oneOf(single(query.target), ISSUE_TARGETS),
        dimension: oneOf(single(query.dimension), Object.values(QualityDimension)),
        severity: oneOf(single(query.severity), Object.values(IssueSeverity)),
        constraintKey: single(query.constraint)
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

    if (state.filters.target) {
        query.target = state.filters.target;
    }

    if (state.filters.dimension) {
        query.dimension = state.filters.dimension;
    }

    if (state.filters.severity) {
        query.severity = state.filters.severity;
    }

    if (state.filters.constraintKey) {
        query.constraint = state.filters.constraintKey;
    }

    return query;
};

const serialise = (query: LocationQueryRaw) => new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)])).toString();

export default defineComponent({
    name: "IssueExplorerView",
    components: { DatePicker, DataQualityIssuesTable },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const i18n = useI18n();

        const initialState = parseQuery(route.query);

        const profileNames = ref<string[]>([]);
        const selectedProfileName = ref<string | undefined>(initialState.profile);
        const selectedAssessmentDate = ref<string | undefined>(initialState.date);
        const initialFilters = initialState.filters;
        const currentFilters = ref<IssueFilters>({ ...initialState.filters });

        const issuesTable = ref<InstanceType<typeof DataQualityIssuesTable> | null>(null);

        const currentState = (): ExplorerState => ({
            profile: selectedProfileName.value,
            date: selectedAssessmentDate.value || undefined,
            filters: currentFilters.value
        });

        // Filter edits replace the entry; only a drill-down from another page pushes one.
        const mirrorToUrl = () => {
            const query = toQuery(currentState());

            if (serialise(query) !== serialise(route.query as LocationQueryRaw)) {
                router.replace({ query });
            }
        };

        const onFiltersChanged = (filters: IssueFilters) => {
            currentFilters.value = { ...filters };
            mirrorToUrl();
        };

        // The URL changed underneath us (Back, Forward, or a drill-down while already here).
        watch(() => route.query, query => {
            const state = parseQuery(query);

            if (serialise(toQuery(state)) === serialise(toQuery(currentState()))) {
                return;
            }

            selectedProfileName.value = state.profile ?? selectedProfileName.value;
            selectedAssessmentDate.value = state.date;
            currentFilters.value = { ...state.filters };
            issuesTable.value?.applyFilters(state.filters);
        });

        watch([selectedProfileName, selectedAssessmentDate], mirrorToUrl);

        onMounted(() => {
            document.title = i18n.t("routeLabel.issueExplorer");

            DataQualityService.listProfileNames().then(response => {
                profileNames.value = [
                    ...new Set(response.data.map(profile => profile.profileName))
                ];

                if (!selectedProfileName.value ||
                    !profileNames.value.includes(selectedProfileName.value)) {
                    selectedProfileName.value = profileNames.value[0];
                }
            });
        });

        return {
            profileNames, selectedProfileName, selectedAssessmentDate, initialFilters,
            issuesTable, onFiltersChanged
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
</style>
