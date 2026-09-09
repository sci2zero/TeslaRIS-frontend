<template>
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-4 sm:px-5 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <!-- Total Publications -->
            <div class="flex items-start gap-3 py-3 sm:py-2 sm:px-5 first:sm:pl-1 last:sm:pr-1">
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <span class="mdi mdi-file-document text-white text-lg"></span>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-xs text-blue-600 font-medium uppercase tracking-wide truncate">
                        {{ $t("totalPublicationsLabel") }} (TeslaRIS)
                    </div>
                    <div class="flex items-baseline gap-2 flex-wrap mt-1">
                        <v-progress-circular
                            v-if="loading"
                            size="22"
                            width="2"
                            color="primary"
                            indeterminate
                        />
                        <span v-else class="text-2xl font-bold text-blue-800 leading-tight">
                            {{ featuredInformation?.publicationCount }}
                        </span>
                        <span
                            v-if="featuredInformation?.publicationCount"
                            class="text-sm text-blue-600 font-medium">
                            <span class="mdi mdi-trending-up"></span>
                            +{{ featuredInformation.publicationsGain }} {{ $t("thisYearLabel") }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- H-Index -->
            <div class="flex items-start gap-3 py-3 sm:py-2 sm:px-5">
                <div class="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <span class="mdi mdi-chart-line text-white text-lg"></span>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-xs text-emerald-600 font-medium uppercase tracking-wide truncate">
                        H-Index (OpenAlex)
                    </div>
                    <div class="flex items-baseline gap-2 flex-wrap mt-1">
                        <v-progress-circular
                            v-if="loading"
                            size="22"
                            width="2"
                            color="emerald-800"
                            indeterminate
                        />
                        <span v-else class="text-2xl font-bold text-emerald-800 leading-tight">
                            {{ featuredInformation?.hIndex ? featuredInformation?.hIndex : $t("notHarvestedLabel") }}
                        </span>
                        <span
                            v-if="featuredInformation?.hIndex"
                            class="text-sm text-emerald-600 font-medium">
                            Hirsch index
                        </span>
                    </div>
                </div>
            </div>

            <!-- Citations -->
            <div class="flex items-start gap-3 py-3 sm:py-2 sm:px-5">
                <div class="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <span class="mdi mdi-format-quote-close text-white text-lg"></span>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-xs text-amber-600 font-medium uppercase tracking-wide truncate">
                        {{ $t("totalCitationsLabel") }} (OpenAlex)
                    </div>
                    <div class="flex items-baseline gap-2 flex-wrap mt-1">
                        <v-progress-circular
                            v-if="loading"
                            size="22"
                            width="2"
                            color="amber-800"
                            indeterminate
                        />
                        <span v-else class="text-2xl font-bold text-amber-800 leading-tight">
                            {{ featuredInformation?.currentCitationCount ? featuredInformation?.currentCitationCount : $t("notHarvestedLabel") }}
                        </span>
                        <span
                            v-if="featuredInformation?.currentCitationCount"
                            class="text-sm text-amber-600 font-medium">
                            <span
                                :class="`mdi mdi-trending-${areCitationsTrendingUp ? 'up' : 'down'}`">
                            </span>
                            {{ areCitationsTrendingUp ? "+" : "-" }}{{ featuredInformation.currentCitationTrend }} {{ $t("thisYearLabel") }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 pt-3 border-t border-slate-100">
            <div class="min-w-0">
                <div class="text-[11px] text-slate-500 uppercase tracking-wide leading-tight break-words">
                    {{ $t("journalPublicationsLabel") }}
                </div>
                <div class="text-base font-bold text-slate-800 mt-0.5">
                    {{ featuredInformation?.journalPublicationsCount }}
                </div>
            </div>
            <div class="min-w-0">
                <div class="text-[11px] text-slate-500 uppercase tracking-wide leading-tight break-words">
                    {{ $t("proceedingsPublicationsLabel") }}
                </div>
                <div class="text-base font-bold text-slate-800 mt-0.5">
                    {{ featuredInformation?.proceedingsPublicationsCount }}
                </div>
            </div>
            <div class="min-w-0">
                <div class="text-[11px] text-slate-500 uppercase tracking-wide leading-tight break-words">
                    {{ $t("monographsLabel") }}
                </div>
                <div class="text-base font-bold text-slate-800 mt-0.5">
                    {{ featuredInformation?.monographsCount }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { type PersonFeaturedInformation } from '@/models/Common';
import PersonVisualizationService from '@/services/visualization/PersonVisualizationService';
import { ref, watch } from 'vue';


const props = defineProps({
    personId: {
        type: Number,
        required: true
    }
});


const featuredInformation = ref<PersonFeaturedInformation>();
const areCitationsTrendingUp = ref(true);
const loading = ref(false);

const fetchFeaturedInformation = () => {
    if (!props.personId) {
        return;
    }

    loading.value = true;
    PersonVisualizationService.getFeaturedInformationForPerson(
        props.personId
    ).then(response => {
        featuredInformation.value = response.data;
        areCitationsTrendingUp.value = !!featuredInformation.value?.currentCitationTrend && featuredInformation.value?.currentCitationTrend > 0;
    }).finally(() => {
        loading.value = false
    });
};

watch(() => props.personId, () => {
    fetchFeaturedInformation();
}, { immediate: true });

</script>
