<template>
    <div>
        <h3 class="issues-title">
            {{ $t("dataQualityIssuesLabel") }}
        </h3>

        <v-card variant="flat" class="dq-card mb-5">
            <v-card-text>
                <v-row align="center">
                    <v-col cols="12" md="2">
                        <v-select
                            v-model="filters.target"
                            :items="targetOptions"
                            :label="$t('targetEntityTypeLabel')"
                            density="compact"
                            clearable
                            hide-details
                        />
                    </v-col>
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
                        <v-autocomplete
                            v-model="filters.constraintKey"
                            :items="constraintOptions"
                            :label="$t('constraintLabel')"
                            :no-data-text="$t('noMatchingConstraintsMessage')"
                            density="compact"
                            auto-select-first
                            clearable
                            hide-details
                        />
                    </v-col>
                    <v-col cols="12" md="3" class="d-flex gap-2">
                        <v-btn color="primary" variant="outlined" @click="clearFilters">
                            {{ $t("clearLabel") }}
                        </v-btn>
                        <v-btn
                            color="primary"
                            variant="text"
                            prepend-icon="mdi-refresh"
                            :disabled="loading"
                            @click="resetAndFetch">
                            {{ $t("refreshLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <tab-content-loader v-if="loading" :button-header="false" layout="table" />

        <v-card v-else variant="flat" class="dq-card">
            <v-card-text>
                <div v-if="issues.length === 0" class="text-medium-emphasis">
                    {{ $t("noFailedConstraintsMessage") }}
                </div>

                <template v-else>
                    <v-table density="compact">
                        <thead>
                            <tr>
                                <th>{{ $t("affectedRecordLabel") }}</th>
                                <th>{{ $t("targetEntityTypeLabel") }}</th>
                                <th>{{ $t("constraintLabel") }}</th>
                                <th>{{ $t("dimensionLabel") }}</th>
                                <th>{{ $t("severityLabel") }}</th>
                                <th>{{ $t("actionLabel") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="issue in issues"
                                :key="`${issue.assessmentId}-${issue.ruleKey}`">
                                <td class="context-value">
                                    <localized-link :to="getLandingPageBasePath(issue.entityType) + issue.entityId">
                                        {{ $i18n.locale.startsWith('sr') ? issue.entityNameSr : issue.entityNameOther }}
                                    </localized-link>
                                </td>
                                <td>{{ issue.target }}</td>
                                <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(issue.title) as string) }}</td>
                                <td>{{ getQualityDimensionTitleFromValueAutoLocale(issue.dimension) }}</td>
                                <td>
                                    <v-chip
                                        :color="severityColors[issue.severity]"
                                        variant="tonal"
                                        size="small">
                                        {{ getIssueSeverityTitleFromValueAutoLocale(issue.severity) }}
                                    </v-chip>
                                </td>
                                <td>
                                    <v-btn
                                        density="compact"
                                        variant="text"
                                        color="primary"
                                        append-icon="mdi-arrow-right"
                                        @click="showIssueDetails(issue)">
                                        {{ $t("viewDetailsLabel") }}
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>

                    <div class="d-flex align-center justify-space-between mt-4">
                        <span class="text-medium-emphasis text-caption">
                            {{ $t("shownOfTotalIssuesLabel", { shown: issues.length, total: totalIssues }) }}
                        </span>
                        <v-spacer />
                        <v-btn
                            v-if="nextCursor"
                            variant="outlined"
                            color="primary"
                            density="comfortable"
                            :loading="loadingMore"
                            @click="loadMore">
                            {{ $t("loadMoreLabel", { count: PAGE_SIZE }) }}
                        </v-btn>
                    </div>
                </template>
            </v-card-text>
        </v-card>

        <data-quality-issue-details-modal
            v-model="detailsDialog"
            :assessment-id="detailsAssessmentId"
            :rule-key="detailsRuleKey"
            :record-name-sr="detailsRecordNameSr"
            :record-name-other="detailsRecordNameOther"
            :current-entity-type="scope?.entityType"
            :current-entity-id="scope?.entityId"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
    IssueSeverity,
    QualityDimension,
    RELATED_ENTITY_TARGETS,
    SEVERITY_COLORS,
    type ConstraintSummary,
    type DataQualityIssue
} from "@/models/RevisionModel";
import { EntityType } from "@/models/MergeModel";
import DataQualityService from "@/services/revision/DataQualityService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import {
    getQualityDimensionsForGivenLocale,
    getQualityDimensionTitleFromValueAutoLocale
} from "@/i18n/qualityDimension";
import {
    getIssueSeveritiesForGivenLocale,
    getIssueSeverityTitleFromValueAutoLocale
} from "@/i18n/issueSeverity";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { getLandingPageBasePath } from "@/utils/PathResolutionUtil";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import DataQualityIssueDetailsModal from "@/components/core/revisions/DataQualityIssueDetailsModal.vue";


interface IssueFilters {
    target?: string;
    dimension?: QualityDimension;
    severity?: IssueSeverity;
    constraintKey?: string;
}

interface IssueScope {
    entityType: string;
    entityId: number;
}

const EMPTY_FILTERS: IssueFilters = {
    target: undefined,
    dimension: undefined,
    severity: undefined,
    constraintKey: undefined
};

const PAGE_SIZE = 50;

export default defineComponent({
    name: "DataQualityIssuesTable",
    components: { TabContentLoader, LocalizedLink, DataQualityIssueDetailsModal },
    props: {
        profileName: {
            type: String,
            default: undefined
        },
        personId: {
            type: Number,
            default: undefined
        },
        organisationUnitId: {
            type: Number,
            default: undefined
        },
        // Read once at creation so a lazily rendered table's first fetch is already narrowed.
        initialTarget: {
            type: String,
            default: undefined
        }
    },
    setup(props) {
        const issues = ref<DataQualityIssue[]>([]);
        const loading = ref(false);
        const loadingMore = ref(false);
        const nextCursor = ref<string | null>(null);
        const totalIssues = ref(0);
        const filters = ref<IssueFilters>({ ...EMPTY_FILTERS, target: props.initialTarget });

        const targetOptions = Object.values(RELATED_ENTITY_TARGETS);
        const dimensionOptions = ref(getQualityDimensionsForGivenLocale());
        const severityOptions = ref(getIssueSeveritiesForGivenLocale());

        // Either one entity's issues or, with neither id given, the whole repository's.
        const scope = computed<IssueScope | undefined>(() => {
            if (props.personId) {
                return { entityType: EntityType.PERSON, entityId: props.personId };
            }

            if (props.organisationUnitId) {
                return {
                    entityType: EntityType.ORGANISATION_UNIT,
                    entityId: props.organisationUnitId
                };
            }

            return undefined;
        });

        // Constraints are profile configuration, so they are fetched apart from the issues.
        const constraints = ref<ConstraintSummary[]>([]);

        const constraintOptions = computed(() =>
            constraints.value
                .map(constraint => ({
                    title: displayTextOrPlaceholder(
                        returnCurrentLocaleContent(constraint.title) as string),
                    value: constraint.key
                }))
                .sort((first, second) => first.title.localeCompare(second.title)));

        const fetchConstraints = () => {
            if (!props.profileName) {
                constraints.value = [];
                return;
            }

            DataQualityService.listProfileConstraints(
                props.profileName, filters.value.target
            ).then(response => {
                constraints.value = response.data;
            }).catch(() => {
                constraints.value = [];
            });
        };

        // Only the newest in-flight request may write the rows.
        let latestRequest = 0;

        const fetchIssues = (append = false) => {
            const request = ++latestRequest;

            // TODO: the repository-wide listing has no endpoint yet.
            if (!props.profileName || !scope.value) {
                issues.value = [];
                totalIssues.value = 0;
                nextCursor.value = null;
                loading.value = false;
                loadingMore.value = false;
                return;
            }

            if (append) {
                loadingMore.value = true;
            } else {
                loading.value = true;
                nextCursor.value = null;
            }

            DataQualityService.getIssuesForEntity(
                scope.value.entityType,
                scope.value.entityId,
                props.profileName,
                filters.value.target,
                filters.value.dimension,
                filters.value.severity,
                filters.value.constraintKey,
                append ? nextCursor.value ?? undefined : undefined,
                PAGE_SIZE
            ).then(response => {
                if (request !== latestRequest) {
                    return;
                }

                issues.value = append
                    ? withoutDuplicates([...issues.value, ...response.data.content])
                    : response.data.content;
                totalIssues.value = response.data.totalIssues;
                nextCursor.value = response.data.nextCursor;
            }).catch(() => {
                if (request !== latestRequest) {
                    return;
                }

                // A failed load-more keeps its cursor so the button can retry.
                if (!append) {
                    issues.value = [];
                    totalIssues.value = 0;
                    nextCursor.value = null;
                }
            }).finally(() => {
                if (request === latestRequest) {
                    loading.value = false;
                    loadingMore.value = false;
                }
            });
        };

        // A record fixed between two loads is reassessed and can be served again under a new id.
        const withoutDuplicates = (rows: DataQualityIssue[]) => {
            const seen = new Set<string>();

            return rows.filter(issue => {
                const key = `${issue.assessmentId}-${issue.ruleKey}`;

                if (seen.has(key)) {
                    return false;
                }

                seen.add(key);
                return true;
            });
        };

        const resetAndFetch = () => fetchIssues(false);

        const loadMore = () => {
            if (nextCursor.value && !loadingMore.value) {
                fetchIssues(true);
            }
        };

        const clearFilters = () => {
            filters.value = { ...EMPTY_FILTERS };
        };

        // Re-applying the filter already in place still refreshes the rows.
        const filterByTarget = (target: string) => {
            const alreadyFiltered = filters.value.target === target &&
                !filters.value.dimension && !filters.value.severity &&
                !filters.value.constraintKey;

            filters.value = { ...EMPTY_FILTERS, target };

            if (alreadyFiltered) {
                resetAndFetch();
            }
        };

        const detailsDialog = ref(false);
        const detailsAssessmentId = ref<number | undefined>(undefined);
        const detailsRuleKey = ref<string | undefined>(undefined);
        const detailsRecordNameSr = ref("");
        const detailsRecordNameOther = ref("");

        const showIssueDetails = (issue: DataQualityIssue) => {
            detailsAssessmentId.value = issue.assessmentId;
            detailsRuleKey.value = issue.ruleKey;
            detailsRecordNameSr.value = issue.entityNameSr;
            detailsRecordNameOther.value = issue.entityNameOther;
            detailsDialog.value = true;
        };

        const i18n = useI18n();

        watch(i18n.locale, () => {
            dimensionOptions.value = getQualityDimensionsForGivenLocale();
            severityOptions.value = getIssueSeveritiesForGivenLocale();
        });

        watch(() => [props.profileName, props.personId, props.organisationUnitId], () => {
            fetchConstraints();
            resetAndFetch();
        }, { immediate: true });

        watch(() => filters.value.target, fetchConstraints);

        watch(filters, () => {
            const constraintKey = filters.value.constraintKey;

            if (constraintKey &&
                !constraintOptions.value.some(option => option.value === constraintKey)) {
                filters.value.constraintKey = undefined;
                return;
            }

            resetAndFetch();
        }, { deep: true });

        return {
            issues, loading, loadingMore, nextCursor, totalIssues, filters, scope, loadMore,
            PAGE_SIZE,
            severityColors: SEVERITY_COLORS, targetOptions, dimensionOptions, severityOptions, constraintOptions,
            clearFilters, resetAndFetch, filterByTarget, showIssueDetails,
            detailsDialog, detailsAssessmentId, detailsRuleKey,
            detailsRecordNameSr, detailsRecordNameOther,
            getLandingPageBasePath, returnCurrentLocaleContent, displayTextOrPlaceholder,
            getQualityDimensionTitleFromValueAutoLocale, getIssueSeverityTitleFromValueAutoLocale
        };
    }
});
</script>

<style scoped>
.issues-title {
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    margin: 16px 0;
}

.context-value {
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
}

.dq-card {
    background-color: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.25);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.10);
}
</style>
