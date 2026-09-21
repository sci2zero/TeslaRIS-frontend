<template>
    <div class="entity-types-tab">
        <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="entity-types-title">
                {{ $t("qualityByEntityTypeLabel") }}
            </h2>

            <v-btn
                variant="outlined"
                color="primary"
                append-icon="mdi-download"
                :disabled="!profileName"
                class="mt-2 ms-auto"
                @click="downloadReport">
                {{ $t("downloadReportLabel") }}
            </v-btn>
        </div>

        <v-card class="entity-types-card" variant="flat">
            <v-card-text>
                <tab-content-loader v-if="loading" layout="table" />

                <div v-else-if="rows.length === 0" class="text-medium-emphasis">
                    {{ $t("noAssessmentsLabel") }}
                </div>

                <v-table v-else density="comfortable">
                    <thead>
                        <tr>
                            <th>{{ $t("entityTypeLabel") }}</th>
                            <th>{{ $t("recordsLabel") }}</th>
                            <th>{{ $t("averageScoreLabel") }}</th>
                            <th>{{ $t("publicationCandidatesLabel") }}</th>
                            <th>{{ $t("affectedRecordsLabel") }}</th>
                            <th>{{ $t("openIssuesLabel") }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in rows" :key="row.entityType">
                            <td class="entity-type-name">
                                {{ $t(entityTypeLabels[row.entityType]) }}
                            </td>
                            <td>{{ row.supported ? localiseNumber(row.records) : "-" }}</td>
                            <td class="numeric-emphasis">
                                {{ formatPercentage(row.averageScore) }}
                            </td>
                            <td>
                                {{ formatPercentage(row.publicationCandidatePercentage) }}
                            </td>
                            <td>
                                {{ row.supported ? localiseNumber(row.affectedRecords) : "-" }}
                            </td>
                            <td class="numeric-emphasis">
                                {{ row.supported ? localiseNumber(row.openIssues) : "-" }}
                            </td>
                            <td>
                                <v-btn
                                    density="compact"
                                    variant="text"
                                    color="primary"
                                    append-icon="mdi-arrow-right"
                                    :disabled="!row.supported || row.openIssues === 0"
                                    @click="openIssues(row)">
                                    {{ $t("openIssuesLabel") }}
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import RepositoryAnalyticsService from "@/services/revision/RepositoryAnalyticsService";
import { RepositoryEntityType, type EntityTypeQuality } from "@/models/RevisionModel";
import TabContentLoader from "@/components/core/TabContentLoader.vue";


const ENTITY_TYPE_LABELS: Record<RepositoryEntityType, string> = {
    [RepositoryEntityType.PERSONS]: "routeLabel.persons",
    [RepositoryEntityType.ORGANISATION_UNITS]: "organisationUnitsLabel",
    [RepositoryEntityType.OUTPUTS]: "outputsLabel",
    [RepositoryEntityType.ACTIVITIES]: "activitiesLabel",
    [RepositoryEntityType.PROJECTS]: "projectsLabel",
    [RepositoryEntityType.FUNDINGS]: "fundingsLabel"
};

export default defineComponent({
    name: "RepositoryEntityTypesTab",
    components: { TabContentLoader },
    props: {
        profileName: {
            type: String,
            default: undefined
        },
        assessmentDate: {
            type: String,
            default: undefined
        }
    },
    emits: ["openIssues"],
    setup(props, { emit }) {
        const rows = ref<EntityTypeQuality[]>([]);
        const loading = ref(false);

        const i18n = useI18n();

        const localiseNumber = (value: number) => value.toLocaleString(i18n.locale.value);

        const formatPercentage = (value: number | null) =>
            value === null || value === undefined ? "-" : `${value.toFixed(1)}%`;

        const fetchRows = () => {
            if (!props.profileName) {
                rows.value = [];
                return;
            }

            loading.value = true;

            RepositoryAnalyticsService.getQualityByEntityType(
                props.profileName, props.assessmentDate
            ).then(response => {
                rows.value = response.data;
            }).catch(() => {
                rows.value = [];
            }).finally(() => {
                loading.value = false;
            });
        };

        const openIssues = (row: EntityTypeQuality) => {
            emit("openIssues", row.entityType);
        };

        const downloadReport = () => {
            if (!props.profileName) {
                return;
            }

            RepositoryAnalyticsService.downloadQualityByEntityType(
                props.profileName, props.assessmentDate, i18n.locale.value);
        };

        watch(() => [props.profileName, props.assessmentDate], fetchRows, { immediate: true });

        return {
            rows, loading, entityTypeLabels: ENTITY_TYPE_LABELS,
            localiseNumber, formatPercentage, openIssues, downloadReport
        };
    }
});
</script>

<style scoped>
.entity-types-tab {
    padding-top: 8px;
}

.entity-types-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.4rem;
    font-weight: 700;
}

.entity-types-card {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}

.entity-type-name {
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
}

.numeric-emphasis {
    font-weight: 700;
}
</style>
