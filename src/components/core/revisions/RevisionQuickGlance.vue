<template>
    <entity-details-sheet
        :model-value="modelValue"
        :title="`${$t('versionLabel')} ${revision.majorVersion}.${revision.minorVersion}`"
        @update:model-value="$emit('update:modelValue', $event)">
        <template #icon>
            <span class="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <v-icon icon="mdi-history" />
            </span>
        </template>
        <div class="space-y-5">
            <div class="entity-details-grid">
                <entity-detail-field :label="$t('dateLabel')">
                    {{ localiseDate(revision.timestamp) }}
                </entity-detail-field>
                <entity-detail-field :label="$t('createdByLabel')">
                    {{ displayTextOrPlaceholder(revision.createdBy) }}
                </entity-detail-field>
                <entity-detail-field :label="$t('versionNoteLabel')" class="entity-details-full-width">
                    <p class="whitespace-pre-line">
                        {{ note }}
                    </p>
                </entity-detail-field>
            </div>
            <section v-if="revision.restorationWarnings?.length" class="space-y-3">
                <h3 class="text-sm font-semibold text-slate-800">
                    {{ $t('restorationWarningsLabel') }}
                </h3>
                <p class="text-sm text-slate-500">
                    {{ $t('restorationWarningsExplanationMessage') }}
                </p>
                <div
                    v-for="(warning, index) in revision.restorationWarnings"
                    :key="`${warning.fieldPath}-${index}`"
                    class="space-y-2 rounded-lg border border-slate-200 p-3">
                    <v-chip :color="warning.outcome === DegradationOutcome.DEGRADED ? 'warning' : 'error'" variant="tonal" size="small">
                        {{ warning.outcome === DegradationOutcome.DEGRADED ? $t('referenceDegradedLabel') : $t('referenceDroppedLabel') }}
                    </v-chip>
                    <p class="text-sm text-slate-700">
                        {{ $t(warning.messageKey, warning.parameters) }}
                    </p>
                    <p class="text-xs text-slate-500 break-words">
                        {{ warning.fieldPath }}
                    </p>
                </div>
            </section>
            <section class="space-y-3">
                <h3 class="text-sm font-semibold text-slate-800">
                    {{ $t('dataQualityAssessmentLabel') }}
                </h3>
                <p v-if="!assessments.length" class="text-sm text-slate-500">
                    {{ $t('noAssessmentsLabel') }}
                </p>
                <div v-for="assessment in assessments" :key="`${assessment.profileName}-${assessment.profileVersion}`" class="space-y-2 rounded-lg border border-slate-200 p-3">
                    <p class="text-sm font-semibold text-slate-800 break-words">
                        {{ assessment.profileName }} {{ assessment.profileVersion }}
                    </p>
                    <p class="text-sm text-slate-700">
                        {{ $t('qualityScoreLabel') }}: {{ assessment.dataQualityScore.toFixed(1) }}%
                    </p>
                    <v-chip :color="assessment.publicationCandidate ? 'success' : 'warning'" variant="tonal" size="small">
                        {{ assessment.publicationCandidate ? $t('publicationCandidateLabel') : $t('needsRevisionLabel') }}
                    </v-chip>
                    <p class="text-xs text-slate-500">
                        {{ localiseDate(assessment.assessmentDate) }}
                    </p>
                </div>
            </section>
            <div class="flex flex-wrap gap-2">
                <v-btn variant="outlined" size="small" class="text-none" @click="$emit('assess')">
                    {{ $t('detailedAssessmentLabel') }}
                </v-btn>
                <v-btn
                    v-if="!latest"
                    variant="outlined" size="small" class="text-none"
                    :disabled="!!restoreBlockedReason" :loading="restoring" @click="$emit('restore')">
                    {{ $t('restoreRevisionLabel') }}
                </v-btn>
                <p v-if="!latest && restoreBlockedReason" class="w-full text-sm text-slate-500">
                    {{ restoreBlockedReason }}
                </p>
            </div>
        </div>
    </entity-details-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EntityDetailsSheet from "@/components/core/EntityDetailsSheet.vue";
import EntityDetailField from "@/components/core/EntityDetailField.vue";
import { DegradationOutcome, type Revision } from "@/models/RevisionModel";
import { localiseDate } from "@/utils/DateUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
const props = defineProps<{
    modelValue: boolean;
    revision: Revision;
    note: string;
    latest: boolean;
    restoring: boolean;
    restoreBlockedReason?: string;
}>();
defineEmits<{ "update:modelValue": [value: boolean]; assess: []; restore: [] }>();
const assessments = computed(() => [...props.revision.assessments].sort((a, b) => b.dataQualityScore - a.dataQualityScore));
</script>
