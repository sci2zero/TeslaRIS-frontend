<template>
    <div class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            <!-- Total Publications -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <span class="mdi mdi-file-document text-white text-xl"></span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-blue-600 font-medium uppercase tracking-wide">
                            {{ $t("totalPublicationsLabel") }} (TeslaRIS)
                        </div>
                    </div>
                </div>
                <v-progress-circular
                    v-if="loading"
                    color="primary"
                    indeterminate
                />
                <div v-else class="text-3xl lg:text-4xl font-bold text-blue-800 mb-1">
                    {{ featuredInformation?.publicationCount }}
                </div>
                <div
                    v-if="featuredInformation?.publicationCount"
                    class="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <span 
                        class="mdi mdi-trending-up text-base">
                    </span>
                    +{{ featuredInformation.publicationsGain }} {{ $t("thisYearLabel") }}
                </div>
            </div>

            <!-- H-Index -->
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                        <span class="mdi mdi-chart-line text-white text-xl"></span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-emerald-600 font-medium uppercase tracking-wide">
                            H-Index (OpenAlex)
                        </div>
                    </div>
                </div>
                <v-progress-circular
                    v-if="loading"
                    color="emerald-800"
                    indeterminate
                />
                <div v-else class="text-3xl lg:text-4xl font-bold text-emerald-800 mb-1">
                    {{ featuredInformation?.hIndex ? featuredInformation?.hIndex : $t("notHarvestedLabel") }}
                </div>
                <div
                    v-if="featuredInformation?.hIndex"
                    class="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    Hirsch index
                </div>
            </div>

            <!-- Citations -->
            <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                        <span class="mdi mdi-format-quote-close text-white text-xl"></span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-amber-600 font-medium uppercase tracking-wide">
                            {{ $t("totalCitationsLabel") }} (OpenAlex)
                        </div>
                    </div>
                </div>
                <v-progress-circular
                    v-if="loading"
                    color="amber-800"
                    indeterminate
                />
                <div v-else class="text-3xl lg:text-4xl font-bold text-amber-800 mb-1">
                    {{ featuredInformation?.currentCitationCount ? featuredInformation?.currentCitationCount : $t("notHarvestedLabel") }}
                </div>
                <div
                    v-if="featuredInformation?.currentCitationCount"
                    class="flex items-center gap-2 text-sm text-amber-600 font-medium">
                    <span 
                        :class="`mdi mdi-trending-${areCitationsTrendingUp ? 'up' : 'down'} text-base`">
                    </span>
                    {{ areCitationsTrendingUp ? "+" : "-" }}{{ featuredInformation.currentCitationTrend }} {{ $t("thisYearLabel") }}
                </div>
            </div>
        </div>

        <!-- Additional Metrics Row -->
        <div class="mt-6 pt-6 border-t border-slate-200">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div class="text-center">
                    <div class="text-lg font-bold text-slate-800">
                        {{ featuredInformation?.journalPublicationsCount }}
                    </div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide">
                        {{ $t("journalPublicationsLabel") }}
                    </div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-slate-800">
                        {{ featuredInformation?.proceedingsPublicationsCount }}
                    </div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide">
                        {{ $t("proceedingsPublicationsLabel") }}
                    </div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-slate-800">
                        {{ featuredInformation?.monographsCount }}
                    </div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide">
                        {{ $t("monographsLabel") }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { type PersonFeaturedInformation } from '@/models/Common';
import PersonVisualizationService from '@/services/visualization/PersonVisualizationService';
import { onMounted, ref, watch } from 'vue';


const props = defineProps({
    personId: {
        type: Number,
        required: true
    }
});


const featuredInformation = ref<PersonFeaturedInformation>();
const areCitationsTrendingUp = ref(true);
const loading = ref(false);

onMounted(() => {
    loading.value = true;
});

watch(() => props.personId, () => {
    fetchFeaturedInformation();
});

const fetchFeaturedInformation = () => {
    if (!props.personId) {
        return;
    }

    PersonVisualizationService.getFeaturedInformationForPerson(
        props.personId
    ).then(response => {
        featuredInformation.value = response.data;
        areCitationsTrendingUp.value = !!featuredInformation.value?.currentCitationTrend && featuredInformation.value?.currentCitationTrend > 0;
    }).finally(() => {
        loading.value = false
    });
};

</script>

<style scoped>

.font-serif {
    font-family: 'Georgia', 'Times New Roman', serif;
}

</style>
