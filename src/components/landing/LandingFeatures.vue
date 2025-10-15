<template>
    <div class="bg-gray-100 p-4 md:p-6 lg:p-8 relative overflow-hidden flex flex-col">
        <div class="container mx-auto px-4 py-16">
            <div class="text-center mb-12">
                <h3 class="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-clip-text">
                    {{ $t('landingFeatures.title') }}
                </h3>
                <p class="text-base md:text-lg text-slate-500 max-w-4xl mx-auto leading-relaxed">
                    {{ $t('landingFeatures.subtitle') }}
                </p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Top Researchers -->
                <div class="feature-card">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shadow-md flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-200">
                            <v-icon icon="mdi-account-group" size="32" color="#10b981"></v-icon>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-800 m-0 leading-[1.3]">
                            {{ $t('landingFeatures.topResearchers.title') }}
                        </h4>
                    </div>
                    <div class="flex-1 mb-6">
                        <div v-if="isLoadingResearchers" class="text-center py-8 text-slate-400">
                            <v-icon icon="mdi-loading" size="32" class="animate-spin"></v-icon>
                            <p class="mt-2">
                                {{ $t('loading') }}
                            </p>
                        </div>
                        <div v-else-if="topResearchers.length === 0" class="text-center py-8 text-slate-400">
                            <v-icon icon="mdi-database-off" size="32"></v-icon>
                            <p class="mt-2">
                                {{ $t('noDataInTableMessage') }}
                            </p>
                        </div>
                        <div
                            v-for="(researcher, index) in topResearchers.slice(0, 3)" v-else :key="index" 
                            class="flex items-center justify-between p-4 rounded-xl bg-slate-50 mb-3 transition-all duration-200 cursor-pointer border border-transparent gap-3 hover:bg-slate-100 hover:border-blue-400/20 hover:translate-x-1 last:mb-0"
                            @click="$router.push('/' + $i18n.locale + '/persons/' + researcher.item.databaseId)">
                            <div class="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200 bg-slate-100">
                                <v-icon 
                                    icon="mdi-account-circle" 
                                    size="32" 
                                    color="#94a3b8"
                                ></v-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h6 class="text-sm font-semibold text-slate-800 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ researcher.item.name }}
                                </h6>
                                <p class="text-xs text-slate-500 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ $i18n.locale === 'sr' ? researcher.item.employmentsSr : researcher.item.employmentsOther }}
                                </p>
                                <span class="text-[0.7rem] text-slate-400 font-medium block">{{ researcher.value }} {{ $t('citations') }}</span>
                            </div>
                            <v-icon icon="mdi-arrow-right" size="16" color="#94a3b8"></v-icon>
                        </div>
                    </div>
                    <v-btn 
                        variant="outlined" 
                        color="success" 
                        class="w-full rounded-xl font-semibold normal-case tracking-wide transition-all duration-300 hover:shadow-lg"
                        @click="$router.push('/' + $i18n.locale + '/persons')"
                    >
                        {{ $t('landingFeatures.topResearchers.viewAll') }}
                    </v-btn>
                </div>

                <!-- Top Institutions -->
                <div class="feature-card">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shadow-md flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-200">
                            <v-icon icon="mdi-domain" size="32" color="#f59e0b"></v-icon>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-800 m-0 leading-[1.3]">
                            {{ $t('landingFeatures.topInstitutions.title') }}
                        </h4>
                    </div>
                    <div class="flex-1 mb-6">
                        <div v-if="isLoadingInstitutions" class="text-center py-8 text-slate-400">
                            <v-icon icon="mdi-loading" size="32" class="animate-spin"></v-icon>
                            <p class="mt-2">
                                {{ $t('loading') }}
                            </p>
                        </div>
                        <div v-else-if="topInstitutions.length === 0" class="text-center py-8 text-slate-400">
                            <v-icon icon="mdi-database-off" size="32"></v-icon>
                            <p class="mt-2">
                                {{ $t('noDataInTableMessage') }}
                            </p>
                        </div>
                        <div
                            v-for="(institution, index) in topInstitutions.slice(0, 3)" v-else :key="index" 
                            class="flex items-center justify-between p-4 rounded-xl bg-slate-50 mb-3 transition-all duration-200 cursor-pointer border border-transparent gap-3 hover:bg-slate-100 hover:border-blue-400/20 hover:translate-x-1 last:mb-0"
                            @click="$router.push('/' + $i18n.locale + '/organisation-units/' + institution.item.databaseId)">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-amber-500/10">
                                <v-icon icon="mdi-office-building" size="20" color="#f59e0b"></v-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h6 class="text-sm font-semibold text-slate-800 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ $i18n.locale === 'sr' ? institution.item.nameSr : institution.item.nameOther }}
                                </h6>
                                <p class="text-xs text-slate-500 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ $i18n.locale === 'sr' ? institution.item.superOUNameSr : institution.item.superOUNameOther }}
                                </p>
                                <span class="text-[0.7rem] text-slate-400 font-medium block">{{ institution.value }} {{ $t('citations') }}</span>
                            </div>
                            <v-icon icon="mdi-arrow-right" size="16" color="#94a3b8"></v-icon>
                        </div>
                    </div>
                    <v-btn 
                        variant="outlined" 
                        color="warning" 
                        class="w-full rounded-xl font-semibold normal-case tracking-wide transition-all duration-300 hover:shadow-lg"
                        @click="$router.push('/' + $i18n.locale + '/organisation-units')"
                    >
                        {{ $t('landingFeatures.topInstitutions.viewAll') }}
                    </v-btn>
                </div>

                <!-- Top Publications -->
                <div class="feature-card">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shadow-md flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-200">
                            <v-icon icon="mdi-book-open-page-variant" size="32" color="#3b82f6"></v-icon>
                        </div>
                        <h4 class="text-xl font-semibold text-slate-800 m-0 leading-[1.3]">
                            {{ $t('landingFeatures.topPublications.title') }}
                        </h4>
                    </div>
                    <div class="flex-1 mb-6">
                        <div v-if="isLoadingPublications" class="text-center py-8 text-slate-400">
                            <v-icon icon="mdi-loading" size="32" class="animate-spin"></v-icon>
                            <p class="mt-2">
                                {{ $t('loading') }}
                            </p>
                        </div>
                        <div v-else-if="topPublications.length === 0" class="text-center py-8 text-slate-400">
                            <v-icon icon="mdi-database-off" size="32"></v-icon>
                            <p class="mt-2">
                                {{ $t('noDataInTableMessage') }}
                            </p>
                        </div>
                        <div
                            v-for="(pub, index) in topPublications.slice(0, 3)" v-else :key="index" 
                            class="flex items-center justify-between p-4 rounded-xl bg-slate-50 mb-3 transition-all duration-200 cursor-pointer border border-transparent gap-3 hover:bg-slate-100 hover:border-blue-400/20 hover:translate-x-1 last:mb-0"
                            @click="$router.push('/' + $i18n.locale + '/publications/' + pub.item.databaseId)">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-blue-500/10">
                                <v-icon icon="mdi-book-open-variant" size="20" color="#3b82f6"></v-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h6 class="text-sm font-semibold text-slate-800 m-0 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ $i18n.locale === 'sr' ? pub.item.titleSr || pub.item.apa : pub.item.titleOther || pub.item.apa }}
                                </h6>
                                <p class="text-xs text-slate-500 m-0 mb-1 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {{ pub.item.authorNames }}
                                </p>
                                <span class="text-[0.7rem] text-slate-400 font-medium block">{{ pub.item.year }} • {{ pub.value }} {{ $t('citations') }}</span>
                            </div>
                            <v-icon icon="mdi-arrow-right" size="16" color="#94a3b8"></v-icon>
                        </div>
                    </div>
                    <v-btn 
                        variant="outlined" 
                        color="primary" 
                        class="w-full rounded-xl font-semibold normal-case tracking-wide transition-all duration-300 hover:shadow-lg"
                        @click="$router.push('/' + $i18n.locale + '/publications')"
                    >
                        {{ $t('landingFeatures.topPublications.viewAll') }}
                    </v-btn>
                </div>
            </div>

            <!-- Additional Info Section -->
            <AdditionalInfoSection />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import AdditionalInfoSection from './AdditionalInfoSection.vue';
import GlobalLeaderboardService from '@/services/visualization/GlobalLeaderboardService';
import { type PersonIndex } from '@/models/PersonModel';
import { type OrganisationUnitIndex } from '@/models/OrganisationUnitModel';
import { type DocumentPublicationIndex } from '@/models/PublicationModel';

// Data from API
const topResearchers = ref<{item: PersonIndex, value: number}[]>([]);
const topInstitutions = ref<{item: OrganisationUnitIndex, value: number}[]>([]);
const topPublications = ref<{item: DocumentPublicationIndex, value: number}[]>([]);

// Loading flags
const isLoadingResearchers = ref(true);
const isLoadingInstitutions = ref(true);
const isLoadingPublications = ref(true);

onMounted(() => {
    GlobalLeaderboardService.getTopCitedResearchersLeaderboard()
        .then((response) => {
            topResearchers.value = response.data.map(le => ({
                item: le.a as PersonIndex,
                value: le.b
            }));
        })
        .catch(() => {
            topResearchers.value = [];
        })
        .finally(() => {
            isLoadingResearchers.value = false;
        });

    GlobalLeaderboardService.getTopCitedInstitutionsLeaderboard()
        .then((response) => {
            topInstitutions.value = response.data.map(le => ({
                item: le.a as OrganisationUnitIndex,
                value: le.b
            }));
        })
        .catch(() => {
            topInstitutions.value = [];
        })
        .finally(() => {
            isLoadingInstitutions.value = false;
        });

    GlobalLeaderboardService.getTopCitedDocumentsLeaderboard()
        .then((response) => {
            topPublications.value = response.data.map(le => ({
                item: le.a as DocumentPublicationIndex,
                value: le.b
            }));
        })
        .catch(() => {
            topPublications.value = [];
        })
        .finally(() => {
            isLoadingPublications.value = false;
        });
});
</script>

<style>
@reference "@/assets/main.css";

.feature-card {
    @apply bg-white rounded-[20px] p-4 md:p-6 lg:p-8 shadow-lg border border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
}
</style>

