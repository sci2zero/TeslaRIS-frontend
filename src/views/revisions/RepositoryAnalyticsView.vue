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
                        :items="profileItems"
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

        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start">
            <v-tab value="overview">
                {{ $t("overviewLabel") }}
            </v-tab>
            <v-tab value="trends">
                {{ $t("trendsLabel") }}
            </v-tab>
            <v-tab value="entityTypes">
                {{ $t("entityTypesLabel") }}
            </v-tab>
            <v-tab value="dimensions">
                {{ $t("dimensionsLabel") }}
            </v-tab>
            <v-tab value="publicationCandidates">
                {{ $t("publicationCandidatesLabel") }}
            </v-tab>
            <v-tab value="issueStatistics">
                {{ $t("issueStatisticsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="overview">
                <repository-overview-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                    @open-issues="openConstraintIssues"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="trends">
                <repository-trends-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="entityTypes">
                <repository-entity-types-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                    @open-issues="openEntityTypeIssues"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="dimensions">
                <repository-dimensions-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                    @open-issues="openDimensionIssues"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="publicationCandidates">
                <repository-publication-candidates-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                    @open-issues="openConstraintIssues"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="issueStatistics">
                <repository-issue-statistics-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                    @open-issues="openConstraintIssues"
                />
            </v-tabs-window-item>
        </v-tabs-window>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, type LocationQueryRaw } from "vue-router";
import DatePicker from "@/components/core/DatePicker.vue";
import { useDataQualityProfiles } from "@/composables/useDataQualityProfiles";
import RepositoryOverviewTab from "@/components/core/revisions/RepositoryOverviewTab.vue";
import RepositoryTrendsTab from "@/components/core/revisions/RepositoryTrendsTab.vue";
import RepositoryEntityTypesTab from "@/components/core/revisions/RepositoryEntityTypesTab.vue";
import RepositoryDimensionsTab from "@/components/core/revisions/RepositoryDimensionsTab.vue";
import RepositoryPublicationCandidatesTab from "@/components/core/revisions/RepositoryPublicationCandidatesTab.vue";
import RepositoryIssueStatisticsTab from "@/components/core/revisions/RepositoryIssueStatisticsTab.vue";
import {
    REPOSITORY_ENTITY_TARGETS,
    type QualityDimension,
    type RepositoryEntityType
} from "@/models/RevisionModel";


export default defineComponent({
    name: "RepositoryAnalyticsView",
    components: {
        DatePicker,
        RepositoryOverviewTab,
        RepositoryTrendsTab,
        RepositoryEntityTypesTab,
        RepositoryDimensionsTab,
        RepositoryPublicationCandidatesTab,
        RepositoryIssueStatisticsTab
    },
    setup() {
        const currentTab = ref("overview");
        const { profileKeys, profileItems } = useDataQualityProfiles();
        const selectedProfileName = ref<string | undefined>(undefined);

        const selectedAssessmentDate = ref<string | undefined>((new Date()).toISOString());

        const i18n = useI18n();
        const router = useRouter();

        // Every drill-down is a navigation into the Issue Explorer carrying this page's context.
        const openIssueExplorer = (filters: LocationQueryRaw) => {
            const query: LocationQueryRaw = { ...filters };

            if (selectedProfileName.value) {
                query.profile = selectedProfileName.value;
            }

            if (selectedAssessmentDate.value) {
                query.date = selectedAssessmentDate.value.split("T")[0];
            }

            router.push({ name: "issueExplorer", query });
        };

        const openEntityTypeIssues = (entityType: RepositoryEntityType) =>
            openIssueExplorer({ target: REPOSITORY_ENTITY_TARGETS[entityType] });

        const openDimensionIssues = (dimension: QualityDimension) =>
            openIssueExplorer({ dimension });

        const openConstraintIssues = (
            issue: { entityType?: RepositoryEntityType | null; ruleKey?: string | null }) => {
            const query: LocationQueryRaw = {};

            if (issue.entityType) {
                query.target = REPOSITORY_ENTITY_TARGETS[issue.entityType];
            }

            if (issue.ruleKey) {
                query.constraint = issue.ruleKey;
            }

            openIssueExplorer(query);
        };

        watch(profileKeys, profileKeyList => {
            if (profileKeyList.length === 0) {
                return;
            }

            if (!selectedProfileName.value) {
                selectedProfileName.value = profileKeyList[0];
            }
        }, { immediate: true });

        onMounted(() => {
            document.title = i18n.t("routeLabel.repositoryAnalytics");
        });

        return {
            currentTab, profileItems, selectedProfileName, selectedAssessmentDate,
            openEntityTypeIssues, openDimensionIssues, openConstraintIssues
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
</style>
