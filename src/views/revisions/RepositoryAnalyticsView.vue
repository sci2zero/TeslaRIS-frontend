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
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="dimensions">
                <repository-dimensions-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="publicationCandidates">
                <repository-publication-candidates-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="issueStatistics">
                <repository-issue-statistics-tab
                    :profile-name="selectedProfileName"
                    :assessment-date="selectedAssessmentDate"
                />
            </v-tabs-window-item>
        </v-tabs-window>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import DatePicker from "@/components/core/DatePicker.vue";
import DataQualityService from "@/services/revision/DataQualityService";
import RepositoryOverviewTab from "@/components/core/revisions/RepositoryOverviewTab.vue";
import RepositoryTrendsTab from "@/components/core/revisions/RepositoryTrendsTab.vue";
import RepositoryEntityTypesTab from "@/components/core/revisions/RepositoryEntityTypesTab.vue";
import RepositoryDimensionsTab from "@/components/core/revisions/RepositoryDimensionsTab.vue";
import RepositoryPublicationCandidatesTab from "@/components/core/revisions/RepositoryPublicationCandidatesTab.vue";
import RepositoryIssueStatisticsTab from "@/components/core/revisions/RepositoryIssueStatisticsTab.vue";


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
        const currentTab = ref("entityTypes");
        const profileNames = ref<string[]>([]);
        const selectedProfileName = ref<string | undefined>(undefined);

        const selectedAssessmentDate = ref<string | undefined>((new Date()).toISOString());

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("routeLabel.repositoryAnalytics");

            DataQualityService.listProfileNames().then(response => {
                profileNames.value = [
                    ...new Set(response.data.map(profile => profile.profileName))
                ];

                if (!selectedProfileName.value) {
                    selectedProfileName.value = profileNames.value[0];
                }
            });
        });

        return {
            currentTab, profileNames, selectedProfileName, selectedAssessmentDate
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
