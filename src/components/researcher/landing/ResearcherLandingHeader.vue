<template>
    <div class="mb-8">
        <div class="flex flex-col lg:flex-row items-center lg:items-start">
            <!-- Profile Image -->
            <div class="flex-shrink-0 mb-8 lg:mb-0 lg:mr-12">
                <div class="relative">
                    <div class="w-32 h-32 sm:size-48 lg:size-64 rounded-full overflow-hidden shadow-2xl border-4 border-white ring-4 ring-slate-100">
                        <img src="https://media.licdn.com/dms/image/v2/C5603AQGxtzCVK6GaHA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1563263024808?e=2147483647&v=beta&t=RMkrpatN3DzSBMhrc7DVkuG98ug5ixG-bwYh5yO-bd0"
                            alt="Researcher Profile" class="w-full h-full object-cover" />
                    </div>
                    <!-- Academic Status Badge -->
                    <div class="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                        {{ person?.personalInfo.displayTitle && person.personalInfo.displayTitle.length > 0 ? returnCurrentLocaleContent(person.personalInfo.displayTitle) : $t("researcherLabel") }}
                    </div>
                </div>
            </div>
            
            <div class="flex-1 min-w-0 text-center lg:text-left">
                <!-- Name -->
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-800 mb-3 leading-tight tracking-tight">
                    {{ researcherName }}
                </h1>


                <!-- Affiliation -->
                <div class="mb-6 lg:mb-8">
                    <p class="text-lg sm:text-xl serif font-semibold text-slate-600 font-sans">
                        {{ primaryEmployment?.organisationUnitName ? returnCurrentLocaleContent(primaryEmployment.organisationUnitName) : $t("notYetSetMessage") }}
                    </p>
                    <p class="text-sm text-slate-500 font-sans">
                        {{ primaryEmployment?.employmentPosition ? getEmploymentPositionTitleFromValueAutoLocale(primaryEmployment.employmentPosition) : "" }}
                    </p>
                </div>

                <!-- Academic Identifiers -->
                <div class="mb-6 flex justify-center lg:justify-start">
                    <div class="space-y-3">
                        <!-- ORCID -->
                        <div v-if="person?.personalInfo.orcid" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="text-white text-sm font-bold">iD</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">ORCID</span>
                                <span class="text-slate-700 text-sm font-mono">{{ person.personalInfo.orcid }}</span>
                            </div>
                        </div>

                        <!-- SC Number -->
                        <div v-if="person?.personalInfo.scopusAuthorId" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="text-white text-sm font-bold">SC</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Scopus Author ID</span>
                                <span class="text-slate-700 text-sm font-mono">{{ person.personalInfo.scopusAuthorId }}</span>
                            </div>
                        </div>

                        <!-- Email -->
                        <div v-if="person?.personalInfo.contact?.contactEmail" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="mdi mdi-email text-white text-sm"></span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</span>
                                <span class="text-slate-700 text-sm">{{ person.personalInfo.contact.contactEmail }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <button @click="showDetails = !showDetails" class="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <span class="mdi mr-2" :class="showDetails ? 'mdi-chevron-up' : 'mdi-account-details'"></span>
                        {{ showDetails ? 'Sakrij detalje' : 'Svi detalji' }}
                    </button>
                    <button class="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md">
                        <span class="mdi mdi-download mr-2"></span>
                        Izvezi CV
                    </button>
                </div>
            </div>
        </div>

        <!-- Expandable Details Section -->
        <div v-if="showDetails" class="mt-12 transition-all duration-300 ease-in-out">
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
                <!-- Section Tabs -->
                <div class="border-b border-gray-200">
                    <!-- Desktop Tabs -->
                    <nav class="hidden md:flex space-x-8 px-6" aria-label="Tabs">
                        <button 
                            v-for="tab in tabs" 
                            :key="tab.id"
                            @click="activeTab = tab.id"
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            ]"
                        >
                            {{ tab.name }}
                        </button>
                    </nav>
                    
                    <!-- Mobile Dropdown -->
                    <div class="md:hidden px-6 py-4">
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <button
                                    v-bind="props"
                                    class="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <span>{{ tabs.find(tab => tab.id === activeTab)?.name }}</span>
                                    <span class="mdi mdi-chevron-down text-gray-400"></span>
                                </button>
                            </template>
                            <v-list>
                                <v-list-item
                                    v-for="tab in tabs"
                                    :key="tab.id"
                                    @click="activeTab = tab.id"
                                    :class="activeTab === tab.id ? 'bg-blue-50 text-blue-600' : ''"
                                >
                                    <v-list-item-title>{{ tab.name }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="p-6">
                    <!-- Personal Information Tab -->
                    <div v-if="activeTab === 'personal'" class="space-y-6">
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-account-circle mr-2 text-blue-600"></span>
                                Lični podaci
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Ime</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ person?.personName?.firstname }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Srednje ime</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ person?.personName?.otherName || 'Nije uneto' }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Prezime</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ person?.personName?.lastname }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Datum rođenja</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(person?.personalInfo?.localBirthDate) }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Mesto rođenja</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ person?.personalInfo?.placeOfBirth || 'Nije uneto' }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Pol</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ formatSex(person?.personalInfo?.sex) }}</p>
                                </div>
                            </div>
                        </div>

                        <div v-if="person?.personalInfo?.contact" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-phone mr-2 text-green-600"></span>
                                Kontakt informacije
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Email</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ person.personalInfo.contact.contactEmail }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Telefon</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ person.personalInfo.contact.phoneNumber || 'Nije uneto' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Academic Tab -->
                    <div v-if="activeTab === 'academic'" class="space-y-6">
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-identifier mr-2 text-purple-600"></span>
                                Akademski identifikatori
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-if="person?.personalInfo?.orcid">
                                    <label class="block text-sm font-medium text-gray-700">ORCID</label>
                                    <p class="mt-1 text-sm text-gray-900 font-mono">{{ person.personalInfo.orcid }}</p>
                                </div>
                                <div v-if="person?.personalInfo?.scopusAuthorId">
                                    <label class="block text-sm font-medium text-gray-700">Scopus Author ID</label>
                                    <p class="mt-1 text-sm text-gray-900 font-mono">{{ person.personalInfo.scopusAuthorId }}</p>
                                </div>
                                <div v-if="person?.personalInfo?.openAlexId">
                                    <label class="block text-sm font-medium text-gray-700">OpenAlex ID</label>
                                    <p class="mt-1 text-sm text-gray-900 font-mono">{{ person.personalInfo.openAlexId }}</p>
                                </div>
                                <div v-if="person?.personalInfo?.webOfScienceResearcherId">
                                    <label class="block text-sm font-medium text-gray-700">Web of Science Researcher ID</label>
                                    <p class="mt-1 text-sm text-gray-900 font-mono">{{ person.personalInfo.webOfScienceResearcherId }}</p>
                                </div>
                            </div>
                        </div>

                        <div v-if="employments && employments.length > 0" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-briefcase mr-2 text-green-600"></span>
                                Zaposlenja
                            </h3>
                            <div class="space-y-4">
                                <div v-for="employment in employments" :key="employment.id" class="border-l-4 border-green-500 pl-4">
                                    <h4 class="text-lg font-medium text-gray-900">
                                        {{ employment.organisationUnitName ? returnCurrentLocaleContent(employment.organisationUnitName) : 'Naziv organizacije nije unet' }}
                                    </h4>
                                    <p class="text-sm text-gray-600">
                                        {{ employment.employmentPosition ? getEmploymentPositionTitleFromValueAutoLocale(employment.employmentPosition) : '' }}
                                    </p>
                                    <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                        <span v-if="employment.dateFrom" class="flex items-center">
                                            <span class="mdi mdi-calendar-start mr-1"></span>
                                            Od: {{ formatDate(employment.dateFrom) }}
                                        </span>
                                        <span v-if="employment.dateTo" class="flex items-center">
                                            <span class="mdi mdi-calendar-end mr-1"></span>
                                            Do: {{ formatDate(employment.dateTo) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Biography Tab -->
                    <div v-if="activeTab === 'biography'" class="space-y-6">
                        <div v-if="person?.biography && person.biography.length > 0" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-text mr-2 text-indigo-600"></span>
                                Biografija
                            </h3>
                            <div class="prose prose-sm max-w-none bg-white p-4 rounded text-justify leading-relaxed" v-html="returnCurrentLocaleContent(person.biography)"></div>
                        </div>

                        <div v-if="person?.keyword && person.keyword.length > 0" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-tag mr-2 text-yellow-600"></span>
                                Ključne reči
                            </h3>
                            <div class="bg-white p-4 rounded">
                                <div class="flex flex-wrap gap-2">
                                    <span 
                                        v-for="(keyword, index) in getKeywordsAsArray(person.keyword)" 
                                        :key="index"
                                        class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors duration-200"
                                    >
                                        {{ keyword.trim() }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Expertise Tab -->
                    <div v-if="activeTab === 'expertise'" class="space-y-6">
                        <div v-if="person?.expertisesOrSkills && person.expertisesOrSkills.length > 0" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-lightbulb mr-2 text-orange-600"></span>
                                Ekspertiza i veštine
                            </h3>
                            <div class="space-y-6">
                                <div v-for="expertise in person.expertisesOrSkills" :key="expertise.id" class="border-l-4 border-orange-500 pl-4 bg-white p-4 rounded">
                                    <h4 class="text-lg font-medium text-gray-900 mb-3">{{ returnCurrentLocaleContent(expertise.name) }}</h4>
                                    
                                    <p class="text-sm text-gray-700 mb-3">{{ returnCurrentLocaleContent(expertise.description) }}</p>

                                    <!-- Proofs -->
                                    <div v-if="expertise.proofs && expertise.proofs.length > 0" class="mt-4 pt-3 border-t border-gray-200">
                                        <h5 class="text-sm font-medium text-gray-700 mb-2">Dokazi:</h5>
                                        <div class="space-y-2">
                                            <div v-for="proof in expertise.proofs" :key="proof.id" class="flex items-center space-x-2 text-sm">
                                                <span class="mdi mdi-file-document text-blue-500"></span>
                                                <span class="text-gray-900">{{ proof.fileName }}</span>
                                                <span class="text-gray-500">({{ proof.sizeInMb }} MB)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prizes Tab -->
                    <div v-if="activeTab === 'prizes'" class="space-y-6">
                        <div v-if="person?.prizes && person.prizes.length > 0" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-trophy mr-2 text-amber-600"></span>
                                Nagrade i priznanja
                            </h3>
                            <div class="space-y-6">
                                <div v-for="prize in person.prizes" :key="prize.id" class="border-l-4 border-amber-500 pl-4 bg-white p-4 rounded">
                                    <div v-for="title in prize.title" :key="`${prize.id}-title-${title.languageTagId}`" class="mb-3">
                                        <div class="flex gap-2 items-center mb-2">
                                            <h4 class="text-lg font-medium text-gray-900">{{ title.content }}</h4>
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                                                {{ title.languageTag }}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div v-for="desc in prize.description" :key="`${prize.id}-desc-${desc.languageTagId}`" class="mb-3">
                                        <div class="flex gap-2 items-center mb-2">
                                            <p class="text-sm text-gray-700">{{ desc.content }}</p>
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {{ desc.languageTag }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                        <span class="flex items-center">
                                            <span class="mdi mdi-calendar mr-1"></span>
                                            {{ formatDate(prize.date) }}
                                        </span>
                                    </div>

                                    <!-- Proofs -->
                                    <div v-if="prize.proofs && prize.proofs.length > 0" class="pt-3 border-t border-gray-200">
                                        <h5 class="text-sm font-medium text-gray-700 mb-2">Dokazi:</h5>
                                        <div class="space-y-2">
                                            <div v-for="proof in prize.proofs" :key="proof.id" class="flex items-center space-x-2 text-sm">
                                                <span class="mdi mdi-file-document text-blue-500"></span>
                                                <span class="text-gray-900">{{ proof.fileName }}</span>
                                                <span class="text-gray-500">({{ proof.sizeInMb }} MB)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import PersonService from '@/services/PersonService';
import InvolvementService from '@/services/InvolvementService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import type { Employment } from '@/models/InvolvementModel';
import type { PersonResponse } from '@/models/PersonModel';
import { Sex } from '@/models/PersonModel';
import type { MultilingualContent } from '@/models/Common';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const person = ref<PersonResponse>();
const researcherName = ref("");
const employments = ref<Employment[]>([]);
const showDetails = ref(false);
const activeTab = ref('personal');

const tabs = [
    { id: 'personal', name: 'Lični podaci' },
    { id: 'academic', name: 'Akademski podaci' },
    { id: 'biography', name: 'Biografija i ključne reči' },
    { id: 'expertise', name: 'Ekspertiza' },
    { id: 'prizes', name: 'Nagrade' }
];

const primaryEmployment = computed(() => {
    return employments.value.length > 0 ? employments.value[0] : null;
});

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

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Nije uneto';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('sr-RS');
    } catch {
        return dateString;
    }
};

const formatSex = (sex: Sex | null | undefined): string => {
    if (!sex) return 'Nije uneto';
    switch (sex) {
        case Sex.MALE: return 'Muško';
        case Sex.FEMALE: return 'Žensko';
        default: return 'Nije uneto';
    }
};

const getKeywordsAsArray = (keywords: MultilingualContent[] | undefined): string[] => {
    if (!keywords || keywords.length === 0) return [];
    
    // Get the content from the current locale or first available
    const content = returnCurrentLocaleContent(keywords);
    if (!content) return [];
    
    // Split by newlines and filter out empty strings
    return content.split('\n').filter(keyword => keyword.trim().length > 0);
};
</script>

<style scoped>
.font-serif {
    font-family: 'Georgia', 'Times New Roman', serif;
}

.prose {
    color: #374151;
}

.prose p {
    margin-bottom: 0.75rem;
}

.prose p:last-child {
    margin-bottom: 0;
}
</style>
