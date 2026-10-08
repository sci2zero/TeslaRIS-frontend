<template>
    <button
        v-if="canReviewDataQuality && totalIssueCount > 0"
        type="button"
        class="w-fit max-w-full inline-flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 text-left"
        :class="[
            prominent ? 'shadow-sm' : '',
            hasAnyRemarks
                ? 'cursor-pointer hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2'
                : 'cursor-default'
        ]"
        :disabled="!hasAnyRemarks"
        :aria-label="`${$t('dataQualitySummaryTitleLabel')}: ${totalIssueCount}, ${qualityScore.toFixed(1)}%`"
        @click="openSummary">
        <span
            class="mdi text-4xl leading-none shrink-0"
            :class="hasError ? 'mdi-alert-circle text-red-500' : 'mdi-alert text-amber-500'"
            aria-hidden="true">
        </span>

        <div class="min-w-0 flex items-center gap-2">
            <div>
                <span class="block text-xs font-semibold text-slate-600">
                    {{ $t("dataQualitySummaryTitleLabel") }}
                </span>
                <span class="flex items-baseline gap-1.5 mt-0.5 text-lg font-bold text-slate-800 tabular-nums leading-tight">
                    <span>{{ totalIssueCount }}</span>
                    <span class="text-slate-300 font-medium">·</span>
                    <span>{{ qualityScore.toFixed(1) }}%</span>
                    
                </span>
                
            </div>
            <span
                v-if="hasAnyRemarks"
                class="text-sm font-medium text-slate-400 self-center">
                <span class="mdi mdi-chevron-right"></span>
            </span>
        </div>
    </button>

    <scrollable-dialog
        v-model="dialog"
        :max-width="720"
        body-class="px-5 py-4">
        <template #header>
            <div class="px-5 pt-5 pb-1">
                <h2 class="text-xl sm:text-2xl font-serif font-bold text-slate-800">
                    {{ $t("dataQualityReportLabel") }}
                </h2>
            </div>

            <v-tabs
                v-model="selectedTab"
                color="deep-purple-accent-4"
                align-tabs="start"
                show-arrows
                class="landing-tabs px-2">
                <v-tab
                    v-for="(profile, index) in reports"
                    :key="profile.profileName"
                    :value="index">
                    {{ profile.profileName }}
                </v-tab>
            </v-tabs>
        </template>

        <v-window v-model="selectedTab">
            <v-window-item
                v-for="(profile, index) in reports"
                :key="profile.profileName"
                :value="index">
                <div class="space-y-3">
                    <div
                        v-for="(pair, remarkIndex) in profile.report"
                        :key="`${profile.profileName}-${remarkIndex}`"
                        class="border border-slate-200 rounded-lg px-4 py-3">
                        <div class="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                            {{ pair.a }}
                        </div>
                        <p class="text-sm text-slate-700 mt-1 leading-relaxed">
                            {{ returnCurrentLocaleContent(pair.b) }}
                        </p>
                    </div>
                </div>
            </v-window-item>
        </v-window>

        <template #footer>
            <div class="flex justify-end px-5 py-4">
                <UiButton
                    variant="outline"
                    size="sm"
                    @click="dialog = false">
                    {{ $t("closeLabel") }}
                </UiButton>
            </div>
        </template>
    </scrollable-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
import { IssueSeverity, type QualityReportResponse } from "@/models/RevisionModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import DataQualityService from "@/services/revision/DataQualityService";
import { useUserRole } from "@/composables/useUserRole";
import { UiButton } from "@/components/ui/button";
import ScrollableDialog from "@/components/core/ScrollableDialog.vue";


export default defineComponent({
    name: "QualityReportDialog",
    components: { UiButton, ScrollableDialog },
    props: {
        entityType: {
            type: String,
            required: true
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        prominent: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const dialog = ref(false);

        const reports = ref<QualityReportResponse[]>([]);
        const selectedTab = ref(0);

        const { canReviewDataQuality } = useUserRole();

        const getContent = () => {
            if (!props.entityId || !canReviewDataQuality.value) {
                reports.value = [];
                return;
            }

            DataQualityService.getQualityReportForEntity(
                props.entityType,
                props.entityId
            ).then(response => {
                reports.value = response.data;
                selectedTab.value = 0;
            });
        };

        const hasRemarks = (profile: QualityReportResponse) =>
            (profile.report?.length ?? 0) > 0;

        const totalIssueCount = computed(() =>
            reports.value.reduce((sum, profile) => sum + (profile.issueCount ?? 0), 0)
        );

        const qualityScore = computed(() => {
            if (reports.value.length === 0) {
                return 0;
            }

            return Math.min(...reports.value.map(profile => profile.qualityScore));
        });

        const hasError = computed(() =>
            reports.value.some(profile =>
                profile.report?.some(pair => pair.a === IssueSeverity.ERROR)
            )
        );

        const hasAnyRemarks = computed(() => reports.value.some(hasRemarks));

        const openSummary = () => {
            if (!hasAnyRemarks.value) {
                return;
            }

            const index = reports.value.findIndex(hasRemarks);
            selectedTab.value = index >= 0 ? index : 0;
            dialog.value = true;
        };

        onMounted(() => getContent());

        watch(
            () => [props.entityId, props.entityType, canReviewDataQuality.value],
            getContent
        );

        return {
            dialog,
            reports, selectedTab,
            returnCurrentLocaleContent,
            openSummary, hasAnyRemarks,
            totalIssueCount, qualityScore, hasError,
            canReviewDataQuality
        };
    }
});
</script>

<style scoped>
.font-serif {
    font-family: 'Georgia', 'Times New Roman', serif;
}
</style>
