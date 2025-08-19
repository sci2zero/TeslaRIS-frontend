<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div class="mx-auto max-w-7xl px-6 py-12">
            <!-- Header Section -->
            <ResearcherLandingHeader />
            <ResearcherFeaturedIndicators />

            <!-- Biography and Keywords Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <!-- Biography -->
                <div class="lg:col-span-2">
                    <div class="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-2xl lg:text-3xl font-serif font-bold text-slate-800">
                                Biografija
                            </h3>
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn
                                        v-bind="props"
                                        icon="mdi-dots-vertical"
                                        variant="text"
                                        size="small"
                                        class="text-slate-600 hover:text-slate-800"
                                    ></v-btn>
                                </template>
                                <v-list>
                                    <v-list-item>
                                        <v-list-item-title>
                                            <span class="mdi mdi-pencil mr-2"></span>
                                            Uredi biografiju
                                        </v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>
                                            <span class="mdi mdi-download mr-2"></span>
                                            Izvezi podatke
                                        </v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>
                                            <span class="mdi mdi-share-variant mr-2"></span>
                                            Podeli profil
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                        
                        <div class="prose prose-slate max-w-none">
                            <p class="text-justify text-base lg:text-lg leading-relaxed text-slate-700 mb-4">
                                {{ person?.biography && person.biography.length > 0 ? returnCurrentLocaleContent(person.biography) : $t("notYetSetMessage") }}
                            </p>
                        </div>
                        
                        <button class="mt-6 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-2 transition-colors">
                            <span>Vidi još</span>
                            <span class="mdi mdi-arrow-right text-base"></span>
                        </button>
                    </div>
                </div>

                <!-- Keywords -->
                <div class="lg:col-span-1">
                    <div class="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-2xl lg:text-3xl font-serif font-bold text-slate-800">
                                Ključne reči
                            </h3>
                            <v-btn
                                icon="mdi-dots-vertical"
                                variant="text"
                                size="small"
                                class="text-slate-600 hover:text-slate-800"
                            ></v-btn>
                        </div>

                        <div class="flex flex-wrap gap-2">

                            <span 
                                v-for="(keyword, index) in getKeywordsAsArray(person?.keyword)" 
                                :key="index"
                                class="inline-block px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                                {{ keyword.trim() }}
                            </span>
                            
                            
                        </div>
                    </div>
                </div>
            </div>

            <!-- Publications Section -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 lg:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 class="text-2xl lg:text-3xl font-serif font-bold text-slate-800">
                        Naučni Rezultati
                    </h3>
                    <button class="flex items-center gap-3 px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <span class="mdi mdi-plus text-lg"></span>
                        Dodaj publikaciju
                    </button>
                </div>

                <!-- Publication Type Filters -->
                <div class="flex flex-wrap gap-2 mb-8">
                    <button class="px-6 py-3 bg-slate-800 text-white rounded-lg text-sm font-medium shadow-md">
                        Sve publikacije
                    </button>
                    <button class="px-6 py-3 bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200 hover:bg-slate-100 transition-colors rounded-lg">
                        Radovi u časopisu
                    </button>
                    <button class="px-6 py-3 bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200 hover:bg-slate-100 transition-colors rounded-lg">
                        Knjige
                    </button>
                    <button class="px-6 py-3 bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200 hover:bg-slate-100 transition-colors rounded-lg">
                        Monografije
                    </button>
                </div>

                <!-- Publications Placeholder -->

                <publication-table-component
                    ref="publicationsRef"
                    :publications="publications"
                    :total-publications="totalPublications"
                    enable-export
                    :endpoint-type="ExportableEndpointType.PERSON_OUTPUTS"
                    :endpoint-token-parameters="[`${person?.id}`, publicationSearchParams]"
                    :endpoint-body-parameters="
                        {
                            allowedTypes: selectedPublicationTypes?.map(publicationType => publicationType.value),
                            personId: person.id,
                            commissionId: null
                        }"
                    @switch-page="switchPage">
                </publication-table-component>

                
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="mdi mdi-file-document text-2xl text-slate-400"></span>
                    </div>
                    <h4 class="text-lg font-medium text-slate-600 mb-2">Nema publikacija</h4>
                    <p class="text-slate-500 text-sm">Dodajte svoju prvu publikaciju da počnete</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ResearcherLandingHeader from '@/components/researcher/landing/ResearcherLandingHeader.vue';
import ResearcherFeaturedIndicators from '@/components/researcher/landing/ResearcherFeaturedIndicators.vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { type MultilingualContent, type Country, ExportableEndpointType, ApplicableEntityType } from '@/models/Common';

import { ref } from 'vue';

const publications = ref([]);
const totalPublications = ref(0);
const switchPage = (page: number) => {
    console.log(`Switching to page ${page}`);
};



import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import PersonService from '@/services/PersonService';
import InvolvementService from '@/services/InvolvementService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import type { Employment } from '@/models/InvolvementModel';
import type { PersonResponse } from '@/models/PersonModel';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const person = ref<PersonResponse>();
const researcherName = ref("");
const employments = ref<Employment[]>([]);


onMounted(() => {
    fetchPerson();
});

const fetchPerson = async () => {
    try {
        const response = await PersonService.readPerson(
            parseInt(route.params.id as string)
        );
        
        person.value = response.data;

        // Set document title
        document.title = `${person.value.personName.firstname} ${person.value.personName.lastname}`;

        // Set researcher name
        if (response.data.personName.otherName !== null && response.data.personName.otherName !== "") {
            researcherName.value =
                `${response.data.personName.firstname} (${response.data.personName.otherName}) ${response.data.personName.lastname}`;
        } else {
            researcherName.value =
                `${response.data.personName.firstname} ${response.data.personName.lastname}`;
        }

        // Fetch employments
        employments.value = [];
        if (response.data.employmentIds && response.data.employmentIds.length > 0) {
            const employmentPromises = response.data.employmentIds.map(employmentId => 
                InvolvementService.getEmployment(employmentId)
            );
            
            const employmentResponses = await Promise.all(employmentPromises);
            employments.value = employmentResponses.map(response => response.data);
        }

    } catch (error) {
        console.error('Error fetching person:', error);
        router.push({ name: "notFound" });
    }
};


const getKeywordsAsArray = (keywords: MultilingualContent[] | undefined): string[] => {
    if (!keywords || keywords.length === 0) return [];
    
    const content = returnCurrentLocaleContent(keywords);
    if (!content) return [];
    
    return content.split('\n').filter(keyword => keyword.trim().length > 0);
};

</script>

<style scoped>
.font-serif {
    font-family: 'Georgia', 'Times New Roman', serif;
}

.prose {
    color: inherit;
}

.prose p {
    margin-bottom: 1rem;
}

.prose p:last-child {
    margin-bottom: 0;
}
</style>
