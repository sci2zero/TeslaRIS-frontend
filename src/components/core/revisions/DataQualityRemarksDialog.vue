<template>
    <template v-if="remarksPresent">
        <v-card
            v-for="(profile, index) in reports"
            :key="profile.profileName"
            class="quality-summary-card mb-3"
            variant="flat"
            color="grey-lighten-4"
            @click="openDialog(index)">
            <v-card-text>
                <div class="quality-summary-title">
                    {{ $t("dataQualitySummaryTitleLabel") }}
                </div>

                <div
                    class="quality-summary-score"
                    :class="scoreColorClass(profile.qualityScore)">
                    {{ profile.qualityScore.toFixed(1) }}%
                </div>

                <v-chip
                    :color="profile.publicationCandidate ? 'success' : 'warning'"
                    variant="tonal"
                    size="small"
                    class="quality-summary-chip">
                    {{ profile.publicationCandidate
                        ? $t("publicationCandidateLabel")
                        : $t("needsRevisionLabel") }}
                </v-chip>

                <div
                    class="quality-summary-issues"
                    :class="profile.issueCount > 0 ? 'text-error' : 'text-success'">
                    {{ profile.issueCount }} {{ $t("failedConstraintsLabel") }}
                </div>

                <div class="quality-summary-policy">
                    {{ profile.profileName }}
                </div>

                <div class="quality-summary-date text-medium-emphasis">
                    {{ $t("assessmentDateLabel") }}: {{ localiseDate(profile.assessmentDate) }}
                </div>
            </v-card-text>
        </v-card>
    </template>

    <v-dialog
        v-model="dialog"
        max-width="1000">
        <v-card
            prepend-icon="mdi-alert"
            :title="$t('dataQualityReportLabel')">
            <v-card-text>
                <v-tabs
                    v-model="selectedTab"
                    color="primary">
                    <v-tab
                        v-for="(profile, index) in reports"
                        :key="profile.profileName"
                        :value="index">
                        {{ profile.profileName }}
                    </v-tab>
                </v-tabs>

                <v-window
                    v-model="selectedTab"
                    class="mt-5">
                    <v-window-item
                        v-for="(profile, index) in reports"
                        :key="profile.profileName"
                        :value="index">
                        <template
                            v-for="pair in profile.report"
                            :key="pair.a">
                            <v-alert
                                class="mb-3"
                                variant="tonal"
                                :icon="severityIcons[pair.a]"
                                :type="severityColors[pair.a] as ('success' | 'info' | 'warning' | 'error') ?? 'info'">
                                {{ returnCurrentLocaleContent(pair.b) }}
                            </v-alert>
                        </template>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <template #actions>
                <v-btn
                    class="ms-auto"
                    :text="$t('closeLabel')"
                    @click="dialog = false"
                />
            </template>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
import { IssueSeverity, type QualityReportResponse } from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import DataQualityService from "@/services/revision/DataQualityService";
import { localiseDate } from "@/utils/DateUtil";


export default defineComponent({
    name: "QualityReportDialog",
    props: {
        entityType: {
            type: String,
            required: true
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        }
    },
    setup(props) {
        const dialog = ref(false);
        const remarksPresent = ref(false);

        const reports = ref<QualityReportResponse[]>([]);
        const selectedTab = ref(0);

        const severityIcons = {
            [IssueSeverity.ERROR]: "mdi-alert-circle",
            [IssueSeverity.WARNING]: "mdi-alert",
            [IssueSeverity.INFO]: "mdi-information"
        };

        const severityColors = {
            [IssueSeverity.ERROR]: "error",
            [IssueSeverity.WARNING]: "warning",
            [IssueSeverity.INFO]: "info"
        };

        const getContent = () => {
            if (!props.entityId) {
                reports.value = [];
                remarksPresent.value = false;
                return;
            }

            DataQualityService.getQualityReportForEntity(
                props.entityType,
                props.entityId
            ).then(response => {
                reports.value = response.data;
                remarksPresent.value = reports.value.length > 0;
                selectedTab.value = 0;
            });
        };

        const openDialog = (index: number) => {
            selectedTab.value = index;
            dialog.value = true;
        };

        const scoreColorClass = (score: number) => {
            if (score < 40) {
                return "text-error";
            }

            if (score < 70) {
                return "text-warning";
            }

            return "text-success";
        };

        onMounted(() => getContent());

        watch(
            () => [props.entityId, props.entityType],
            getContent
        );

        return {
            dialog, remarksPresent,
            reports, selectedTab,
            severityIcons, severityColors,
            returnCurrentLocaleContent,
            openDialog, scoreColorClass,
            localiseDate
        };
    }
});
</script>

<style scoped>
.quality-summary-card {
    cursor: pointer;
    transition: box-shadow 0.2s ease;
}

.quality-summary-card:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}

.quality-summary-title {
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    margin-bottom: 8px;
}

.quality-summary-score {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.2;
}

.quality-summary-chip {
    margin-top: 8px;
    font-weight: 600;
}

.quality-summary-issues {
    font-weight: 600;
    margin-top: 16px;
}

.quality-summary-policy {
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
    margin-top: 4px;
}

.quality-summary-date {
    font-size: 0.85rem;
    margin-top: 4px;
}
</style>
