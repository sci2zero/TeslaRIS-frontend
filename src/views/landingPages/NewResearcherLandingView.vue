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
                                <template #activator="{ props }">
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
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <div class="relative">
                            <button 
                                class="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md min-w-[200px]"
                                @click="toggleFilterDropdown"
                            >
                                <span class="mdi mdi-filter-variant text-lg text-slate-500"></span>
                                <span class="text-sm font-medium flex-1 text-left">
                                    {{ selectedPublicationTypes.length === 0 ? 'Svi tipovi publikacija' : `${selectedPublicationTypes.length} tip odabran` }}
                                </span>
                                <span class="mdi mdi-chevron-down text-sm text-slate-500 transition-transform duration-200" :class="{ 'rotate-180': isFilterDropdownOpen }"></span>
                            </button>
                            
                            <!-- Dropdown Menu -->
                            <div v-show="isFilterDropdownOpen" class="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                                <!-- Header -->
                                <div class="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                                    <span class="text-sm font-semibold text-slate-700">Tipovi publikacija</span>
                                    <div class="flex gap-2">
                                        <button 
                                            class="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200"
                                            @click="selectAllPublicationTypes"
                                        >
                                            Sve
                                        </button>
                                        <button 
                                            class="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                                            @click="clearAllPublicationTypes"
                                        >
                                            Očisti
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Filter Options -->
                                <div class="p-4 max-h-64 overflow-y-auto">
                                    <div class="space-y-1">
                                        <label 
                                            v-for="type in publicationTypeSr" 
                                            :key="type.value"
                                            class="flex items-center w-full p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-200"
                                        >
                                            <div class="flex items-center justify-center w-5 h-5 mr-3">
                                                <input 
                                                    v-model="selectedPublicationTypes" 
                                                    type="checkbox"
                                                    :value="type"
                                                    class="w-4 h-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors duration-200"
                                                />
                                            </div>
                                            <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex-1">{{ type.title }}</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Footer -->
                                <div class="p-3 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                                    <div class="text-xs text-slate-500 text-center">
                                        {{ selectedPublicationTypes.length }} od {{ publicationTypeSr.length }} tipova odabrano
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Selected Filters Display -->
                    <div v-if="selectedPublicationTypes.length > 0" class="flex flex-wrap gap-2">
                        <span 
                            v-for="type in selectedPublicationTypes" 
                            :key="type.value"
                            class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                        >
                            <span class="mdi mdi-check-circle text-sm"></span>
                            {{ type.title }}
                            <button 
                                class="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200 group"
                                title="Ukloni filter"
                                @click="removePublicationType(type.value)"
                            >
                                <span class="mdi mdi-close text-xs group-hover:text-blue-800"></span>
                            </button>
                        </span>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="mb-6">
                    <div class="relative">
                        <input 
                            type="text" 
                            placeholder="Pretraži publikacije..."
                            class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            @input="handleSearch"
                        />
                        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <span class="mdi mdi-magnify text-xl"></span>
                        </span>
                    </div>
                </div>

                <!-- Publications Table -->
                <div v-if="publications.length > 0">
                    <publication-table-component
                        ref="publicationsRef"
                        :publications="publications"
                        :total-publications="totalPublications"
                        enable-export
                        :endpoint-type="ExportableEndpointType.PERSON_OUTPUTS"
                        :endpoint-token-parameters="[`${person?.id}`, publicationSearchParams]"
                        :endpoint-body-parameters="
                            {
                                allowedTypes: selectedPublicationTypes.length > 0 
                                    ? selectedPublicationTypes.map(publicationType => publicationType.value)
                                    : publicationTypeSr.map(type => type.value),
                                personId: person?.id || 0,
                                commissionId: null
                            }"
                        @switch-page="switchPage">
                    </publication-table-component>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-12">
                    <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="mdi mdi-file-document text-2xl text-slate-400"></span>
                    </div>
                    <h4 class="text-lg font-medium text-slate-600 mb-2">
                        Nema publikacija
                    </h4>
                    <p class="text-slate-500 text-sm">
                        Dodajte svoju prvu publikaciju da počnete
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ResearcherLandingHeader from '@/components/researcher/landing/ResearcherLandingHeader.vue';
import ResearcherFeaturedIndicators from '@/components/researcher/landing/ResearcherFeaturedIndicators.vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { type MultilingualContent, ExportableEndpointType } from '@/models/Common';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";

import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PersonService from '@/services/PersonService';
import InvolvementService from '@/services/InvolvementService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Employment } from '@/models/InvolvementModel';
import type { PersonResponse } from '@/models/PersonModel';

const route = useRoute();
const router = useRouter();

const person = ref<PersonResponse>();
const researcherName = ref("");
const employments = ref<Employment[]>([]);

// Publication state
const publications = ref<DocumentPublicationIndex[]>([]);
const totalPublications = ref(0);
const page = ref(0);
const size = ref(10);
const sort = ref("");
const direction = ref("");
const publicationSearchParams = ref("tokens=*");
const publicationsRef = ref<typeof PublicationTableComponent>();
const selectedPublicationTypes = ref<{ title: string, value: PublicationType }[]>([]);

// Filter dropdown state
const isFilterDropdownOpen = ref(false);

// Serbian publication types
const publicationTypeSr = [
    { title: "Rad u časopisu", value: PublicationType.JOURNAL_PUBLICATION },
    { title: "Rad sa konferencije", value: PublicationType.PROCEEDINGS_PUBLICATION },
    { title: "Patent", value: PublicationType.PATENT },
    { title: "Zbornik radova", value: PublicationType.PROCEEDINGS },
    { title: "Skup podataka", value: PublicationType.DATASET },
    { title: "Nematerijalni proizvod", value: PublicationType.INTANGIBLE_PRODUCT },
    { title: "Monografija", value: PublicationType.MONOGRAPH },
    { title: "Rad u monografiji", value: PublicationType.MONOGRAPH_PUBLICATION },
    { title: "Završni rad", value: PublicationType.THESIS }
];

onMounted(() => {
    fetchPerson();
    
    // Start with no filters selected (show all publications)
    selectedPublicationTypes.value = [];
    
    // Add click outside handler for dropdown
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    // Clean up event listener
    document.removeEventListener('click', handleClickOutside);
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

        // Fetch publications after person data is loaded
        fetchPublications();

    } catch (error) {
        console.error('Error fetching person:', error);
        router.push({ name: "notFound" });
    }
};

const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
    page.value = nextPage;
    size.value = pageSize;
    sort.value = sortField;
    direction.value = sortDir;
    fetchPublications();
};

const fetchPublications = async () => {
    if (!person.value?.id) {
        return;
    }

    try {
        // If no filters selected, show all publications
        const allowedTypes = selectedPublicationTypes.value.length > 0 
            ? selectedPublicationTypes.value.map(publicationType => publicationType.value)
            : publicationTypeSr.map(type => type.value);

        const publicationResponse = await DocumentPublicationService.findResearcherPublications(
            person.value.id as number,
            allowedTypes,
            `${publicationSearchParams.value}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
        );
        
        publications.value = publicationResponse.data.content;
        totalPublications.value = publicationResponse.data.totalElements;
    } catch (error) {
        console.error('Error fetching publications:', error);
        publications.value = [];
        totalPublications.value = 0;
    }
};

// Clear sort and perform publication search handled within handleSearch

const handleSearch = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.trim();
    
    if (searchTerm === '') {
        publicationSearchParams.value = "tokens=*";
    } else {
        publicationSearchParams.value = `tokens=${encodeURIComponent(searchTerm)}`;
    }
    
    // Reset pagination and fetch new results
    page.value = 0;
    sort.value = "";
    direction.value = "";
    fetchPublications();
};

// Selection helpers are handled via selectAll/clear/remove functions below

const toggleFilterDropdown = () => {
    isFilterDropdownOpen.value = !isFilterDropdownOpen.value;
};

const selectAllPublicationTypes = () => {
    selectedPublicationTypes.value = [...publicationTypeSr];
};

const clearAllPublicationTypes = () => {
    selectedPublicationTypes.value = [];
};

const removePublicationType = (typeValue: PublicationType) => {
    const index = selectedPublicationTypes.value.findIndex(t => t.value === typeValue);
    if (index > -1) {
        selectedPublicationTypes.value.splice(index, 1);
    }
};

const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
        isFilterDropdownOpen.value = false;
    }
};

// Watch for publication type changes
watch(selectedPublicationTypes, () => {
    fetchPublications();
});

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

/* Responsive publication type filters */
@media (max-width: 640px) {
    .flex.flex-wrap.gap-2 {
        gap: 0.5rem;
    }
    
    .flex.flex-wrap.gap-2 button {
        font-size: 0.75rem;
        padding: 0.5rem 0.75rem;
    }
}

@media (max-width: 480px) {
    .flex.flex-wrap.gap-2 {
        gap: 0.25rem;
    }
    
    .flex.flex-wrap.gap-2 button {
        font-size: 0.7rem;
        padding: 0.375rem 0.5rem;
        min-width: fit-content;
    }
}

/* Dropdown positioning and styling */
.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.z-50 {
    z-index: 50;
}

/* Ensure dropdown appears above other content */
.absolute.top-full {
    z-index: 9999;
}

/* Smooth transitions for dropdown */
.transition-all {
    transition: all 0.2s ease-in-out;
}

/* Hover effects for better interactivity */
.hover\:bg-slate-50:hover {
    background-color: #f8fafc;
}

.hover\:bg-blue-50:hover {
    background-color: #eff6ff;
}

.hover\:bg-red-50:hover {
    background-color: #fef2f2;
}
</style>