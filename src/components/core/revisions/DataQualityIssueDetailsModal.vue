<template>
    <v-dialog v-model="dialog" max-width="1200" scrollable>
        <v-card class="issue-details-card">
            <v-card-text>
                <div v-if="loading" class="d-flex justify-center py-10">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>

                <template v-else-if="details">
                    <div class="issue-details-header">
                        <h2 class="issue-details-title">
                            {{ displayTextOrPlaceholder(returnCurrentLocaleContent(details.title) as string) }}
                        </h2>
                        <div class="issue-details-subtitle text-medium-emphasis">
                            {{ $t("failedEvaluationForLabel") }} {{ details.targetObject }}
                        </div>
                    </div>

                    <v-row class="mt-2">
                        <v-col cols="12" md="4">
                            <v-card class="issue-details-panel" variant="flat">
                                <v-card-text>
                                    <h3 class="issue-details-panel-title">
                                        {{ $t("runtimeEvaluationLabel") }}
                                    </h3>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("affectedRecordLabel") }}
                                        </div>
                                        <localized-link
                                            v-if="landingPagePath"
                                            class="issue-details-value"
                                            :to="landingPagePath">
                                            {{ recordName }}
                                        </localized-link>
                                        <div v-else class="issue-details-value">
                                            {{ recordName }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("recordVersionLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.recordMajorVersion }}.{{ details.recordMinorVersion }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("assessmentDateLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ localiseDate(details.assessmentDate) }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("scoreLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.score.toFixed(1) }} / {{ details.maximumScore.toFixed(1) }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("actualValueLabel") }}
                                            <span v-if="details.occurrences.length > 1">
                                                ({{ details.occurrences.length }})
                                            </span>
                                        </div>
                                        <div
                                            v-for="(occurrence, index) in details.occurrences"
                                            :key="index"
                                            class="issue-details-occurrence">
                                            <div class="issue-details-value">
                                                {{ (occurrence.actualValue.length > 0 && details.targetEntityType !== "Activity")
                                                    ? occurrence.actualValue.join(", ")
                                                    : "-" }}
                                            </div>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-card class="issue-details-panel" variant="flat">
                                <v-card-text>
                                    <h3 class="issue-details-panel-title">
                                        {{ $t("constraintDefinitionLabel") }}
                                    </h3>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("titleLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ displayTextOrPlaceholder(returnCurrentLocaleContent(details.title) as string) }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("severityLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.severity }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("targetEntityTypeLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.targetEntityType }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("targetObjectLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.targetObject }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("constraintWeightLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.constraintWeight.toFixed(1) }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("fairRelatedLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.fairRelated ? $t("yesLabel") : $t("noLabel") }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("blockingLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.blocking ? $t("yesLabel") : $t("noLabel") }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("messageLabel") }}
                                        </div>
                                        <div
                                            v-for="(occurence, index) in details.occurrences"
                                            :key="index"
                                            class="issue-details-value">
                                            {{ returnCurrentLocaleContent(occurence.message) }}
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-card class="issue-details-panel" variant="flat">
                                <v-card-text>
                                    <h3 class="issue-details-panel-title">
                                        {{ $t("dataGovernanceProvenanceLabel") }}
                                    </h3>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("policyLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.policy }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("policyVersionLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.policyVersion }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("qualityDimensionLabel") }}
                                        </div>
                                        <div class="issue-details-value">
                                            {{ details.dimension }}
                                        </div>
                                    </div>

                                    <div class="issue-details-field">
                                        <div class="issue-details-label">
                                            {{ $t("dimensionDefinitionLabel") }}
                                        </div>
                                        <div class="issue-details-value issue-details-definition">
                                            {{ displayTextOrPlaceholder(returnCurrentLocaleContent(details.dimensionDefinition) as string) }}
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>

            <v-card-actions>
                <localized-link v-if="isForeignRecord" :to="landingPagePath" open-in-new-tab>
                    <v-btn
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-open-in-new">
                        {{ $t("openLandingPageLabel") }}
                    </v-btn>
                </localized-link>
                <v-spacer />
                <v-btn @click="dialog = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import DataQualityService from "@/services/revision/DataQualityService";
import type { DataQualityIssueDetails } from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import { getLandingPageBasePath } from "@/utils/PathResolutionUtil";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";


export default defineComponent({
    name: "DataQualityIssueDetailsModal",
    components: { LocalizedLink },
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        assessmentId: {
            type: Number,
            default: null
        },
        ruleKey: {
            type: String,
            default: null
        },
        recordNameSr: {
            type: String,
            default: ""
        },
        recordNameOther: {
            type: String,
            default: ""
        },
        currentEntityType: {
            type: String,
            default: ""
        },
        currentEntityId: {
            type: Number,
            default: null
        }
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const dialog = ref(props.modelValue);
        const loading = ref(false);
        const details = ref<DataQualityIssueDetails | null>(null);

        const i18n = useI18n();

        const recordName = computed(() => {
            const name = i18n.locale.value.startsWith("sr")
                ? props.recordNameSr
                : props.recordNameOther;

            if (name) {
                return name;
            }

            return details.value
                ? `${details.value.entityType} #${details.value.entityId}`
                : "";
        });

        const landingPagePath = computed(() => {
            if (!details.value) {
                return "";
            }

            const basePath = getLandingPageBasePath(details.value.entityType);

            return basePath ? `${basePath}${details.value.entityId}` : "";
        });

        // The issues tab lists failures of related records too, so the modal can describe a record
        // other than the one whose landing page is open.
        const isForeignRecord = computed(() =>
            !!details.value && !!landingPagePath.value &&
            (details.value.entityType !== props.currentEntityType ||
                details.value.entityId !== props.currentEntityId));

        const fetchDetails = () => {
            if (!props.assessmentId || !props.ruleKey) {
                return;
            }

            loading.value = true;
            details.value = null;

            DataQualityService.getIssueDetails(props.assessmentId, props.ruleKey)
                .then(response => {
                    details.value = response.data;
                })
                .catch(() => {
                    details.value = null;
                })
                .finally(() => {
                    loading.value = false;
                });
        };

        watch(() => props.modelValue, (value) => {
            dialog.value = value;

            if (value) {
                fetchDetails();
            }
        });

        watch(dialog, (value) => {
            emit("update:modelValue", value);
        });

        return {
            dialog, loading, details, recordName, landingPagePath, isForeignRecord,
            returnCurrentLocaleContent, displayTextOrPlaceholder, localiseDate
        };
    }
});
</script>

<style scoped>
.issue-details-card {
    background-color: white;
}

.issue-details-header {
    padding: 8px 4px 0 4px;
}

.issue-details-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.5rem;
    font-weight: 700;
}

.issue-details-subtitle {
    font-size: 0.85rem;
}

.issue-details-panel {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    height: 100%;
}

.issue-details-panel-title {
    color: rgb(var(--v-theme-primary));
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 14px;
}

.issue-details-field {
    margin-bottom: 14px;
}

.issue-details-label {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.75rem;
    margin-bottom: 2px;
}

.issue-details-value {
    color: rgb(var(--v-theme-primary));
    font-size: 0.9rem;
    font-weight: 600;
    overflow-wrap: anywhere;
    margin-top: 10px;
}

.issue-details-definition {
    font-weight: 500;
    line-height: 1.35;
}

.issue-details-occurrence {
    margin-bottom: 8px;
}

.issue-details-occurrence-message {
    font-size: 0.78rem;
    font-weight: 400;
}
</style>
