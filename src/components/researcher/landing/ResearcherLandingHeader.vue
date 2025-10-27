<template>
    <div class="mb-8">
        <div class="flex flex-col lg:flex-row items-center lg:items-start">
            <!-- Profile Image -->
            <div class="flex-shrink-0 mb-8 lg:mb-0 lg:mr-12">
                <div class="relative">
                    <div class="w-32 h-32 sm:size-48 lg:size-64 rounded-full overflow-hidden shadow-2xl border-4 border-white ring-4 ring-slate-100">
                        <person-profile-image
                            :filename="person?.imageServerFilename"
                            :person-id="person?.id"
                            :can-edit="canEdit">
                        </person-profile-image>
                        <!-- <img
                            src="https://media.licdn.com/dms/image/v2/C5603AQGxtzCVK6GaHA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1563263024808?e=2147483647&v=beta&t=RMkrpatN3DzSBMhrc7DVkuG98ug5ixG-bwYh5yO-bd0"
                            alt="Researcher Profile" class="w-full h-full object-cover" /> -->
                    </div>
                    <!-- Academic Status Badge -->
                    <div class="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                        {{ props.person?.personalInfo.displayTitle && props.person.personalInfo.displayTitle.length > 0 ? returnCurrentLocaleContent(props.person.personalInfo.displayTitle) : $t("researcherLabel") }}
                    </div>
                </div>
            </div>
            
            <div class="flex-1 min-w-0 text-center lg:text-left">
                <!-- Name -->
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-800 mb-3 leading-tight tracking-tight">
                    {{ props.researcherName }}
                </h1>


                <!-- Affiliation -->
                <div class="mb-6 lg:mb-8">
                    <p class="text-lg sm:text-xl serif font-semibold text-slate-600 font-sans">
                        {{ primaryEmployment?.organisationUnitName ? returnCurrentLocaleContent(primaryEmployment.organisationUnitName) : "" }}
                    </p>
                    <p class="text-sm text-slate-500 font-sans">
                        {{ primaryEmployment?.employmentPosition ? getEmploymentPositionTitleFromValueAutoLocale(primaryEmployment.employmentPosition) : "" }}
                    </p>
                </div>

                <!-- Academic Identifiers -->
                <div class="mb-6 flex justify-center lg:justify-start">
                    <div class="space-y-3">
                        <!-- ORCID -->
                        <div v-if="props.person?.personalInfo.orcid" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="text-white text-sm font-bold">iD</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">ORCID</span>
                                <span class="text-slate-700 text-sm font-mono">{{ props.person.personalInfo.orcid }}</span>
                            </div>
                        </div>

                        <!-- SC Number -->
                        <div v-if="props.person?.personalInfo.scopusAuthorId" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="text-white text-sm font-bold">SC</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Scopus Author ID</span>
                                <span class="text-slate-700 text-sm font-mono">{{ props.person.personalInfo.scopusAuthorId }}</span>
                            </div>
                        </div>

                        <!-- Email -->
                        <div v-if="props.person?.personalInfo.contact?.contactEmail" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="mdi mdi-email text-white text-sm"></span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</span>
                                <identifier-link v-if="person?.personalInfo.contact?.contactEmail" :identifier="person?.personalInfo.contact.contactEmail" type="email"></identifier-link>
                                <span v-else>-</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <button class="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" @click="showDetails = !showDetails">
                        <span class="mdi mr-2" :class="showDetails ? 'mdi-chevron-up' : 'mdi-account-details'"></span>
                        {{ showDetails ? t('hideDetailsLabel') : t('allDetailsLabel') }}
                    </button>
                    <!-- <button class="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md">
                        <span class="mdi mdi-download mr-2"></span>
                        Izvezi CV
                    </button> -->
                </div>

                <slot name="actions"></slot>
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
                            :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            ]"
                            @click="activeTab = tab.id"
                        >
                            {{ tab.name }}
                        </button>
                    </nav>
                    
                    <!-- Mobile Dropdown -->
                    <div class="md:hidden px-6 py-4">
                        <v-menu>
                            <template #activator="{ props: menuProps }">
                                <button
                                    v-bind="menuProps"
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
                                    :class="activeTab === tab.id ? 'bg-blue-50 text-blue-600' : ''"
                                    @click="activeTab = tab.id"
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
                                {{ t('personalInfoLabel') }}
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('firstNameLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ props.person?.personName?.firstname }}
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('lastNameLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ props.person?.personName?.lastname }}
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('birthdateLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ formatDate(props.person?.personalInfo?.localBirthDate) }}
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('placeOfBirthLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ props.person?.personalInfo?.placeOfBirth || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('sexLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ formatSex(props.person?.personalInfo?.sex) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Address Information -->
                        <div v-if="props.person?.personalInfo?.postalAddress" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-map-marker mr-2 text-red-600"></span>
                                {{ t('addressLabel') }}
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('streetAndNumberLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ returnCurrentLocaleContent(props.person.personalInfo.postalAddress.streetAndNumber) || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('cityLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ returnCurrentLocaleContent(props.person.personalInfo.postalAddress.city) || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('countryLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ countryName || '-' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Contact Information -->
                        <div v-if="props.person?.personalInfo?.contact" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-phone mr-2 text-green-600"></span>
                                {{ t('contactLabel') }}
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('emailLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ props.person.personalInfo.contact.contactEmail || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('phoneNumberLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ props.person.personalInfo.contact.phoneNumber || '-' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Research Area -->
                        <div v-if="researchArea" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-domain mr-2 text-purple-600"></span>
                                {{ t('researchAreaLabel') }}
                            </h3>
                            <div class="grid grid-cols-1 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">{{ t('researchAreaLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ returnCurrentLocaleContent(researchArea.name) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Academic Identifiers -->
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-identifier mr-2 text-indigo-600"></span>
                                {{ t('identifiersLabel') }}
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">APVNT</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ props.person?.personalInfo?.apvnt || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">eCRIS-ID</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        <identifier-link v-if="person?.personalInfo.eCrisId" :identifier="person?.personalInfo.eCrisId" type="ecris"></identifier-link>
                                        <span v-else>-</span>
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">enaukaID</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ props.person?.personalInfo?.eNaukaId || '-' }}
                                    </p>
                                </div>
                                <div v-if="props.person?.personalInfo?.orcid">
                                    <label class="block text-sm font-medium text-gray-700">ORCID</label>
                                    <div v-if="person?.personalInfo.orcid" class="response">
                                        <identifier-link :identifier="person?.personalInfo.orcid" type="orcid"></identifier-link>
                                    </div>
                                    <div v-else class="response">
                                        -
                                    </div>
                                </div>
                                <div v-if="props.person?.personalInfo?.scopusAuthorId">
                                    <label class="block text-sm font-medium text-gray-700">{{ t('scopusAuthorIdLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        <identifier-link v-if="person?.personalInfo.scopusAuthorId" :identifier="person?.personalInfo.scopusAuthorId" type="scopus_author"></identifier-link>
                                        <span v-else>-</span>
                                    </p>
                                </div>
                                <div v-if="props.person?.personalInfo?.openAlexId">
                                    <label class="block text-sm font-medium text-gray-700">{{ t('openAlexIdLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        <identifier-link v-if="person?.personalInfo.openAlexId" :identifier="person?.personalInfo.openAlexId" type="open_alex"></identifier-link>
                                        <span v-else>-</span>
                                    </p>
                                </div>
                                <div v-if="props.person?.personalInfo?.webOfScienceResearcherId">
                                    <label class="block text-sm font-medium text-gray-700">{{ t('researcherIdLabel') }}</label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        <identifier-link v-if="person?.personalInfo.webOfScienceResearcherId" :identifier="person?.personalInfo.webOfScienceResearcherId" type="researcher_id"></identifier-link>
                                        <span v-else>-</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Website URIs -->
                        <div v-if="props.person?.personalInfo?.uris && props.person.personalInfo.uris.length > 0" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-web mr-2 text-blue-600"></span>
                                {{ t('websiteLabel') }}
                            </h3>
                            <div class="space-y-2">
                                <div v-for="uri in props.person.personalInfo.uris" :key="uri" class="flex items-center">
                                    <span class="mdi mdi-link text-gray-400 mr-2"></span>
                                    <a :href="uri" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm underline">
                                        {{ uri }}
                                    </a>
                                </div>
                                <!-- <uri-list :uris="person?.personalInfo.uris"></uri-list> -->
                            </div>
                        </div>

                        <!-- Employments -->
                        <div v-if="activeEmployments && activeEmployments.length > 0" class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span class="mdi mdi-office-building mr-2 text-orange-600"></span>
                                {{ t('employmentsLabel') }}
                            </h3>
                            <div class="space-y-3">
                                <div v-for="employment in activeEmployments.slice(0, 5)" :key="employment.id" class="border-l-4 border-orange-200 pl-4">
                                    <localized-link
                                        v-if="employment.organisationUnitId"
                                        :to="'organisation-units/' + employment.organisationUnitId"
                                        class="font-medium text-gray-900 underline"
                                    >
                                        <div class="font-medium text-gray-900">
                                            <v-icon icon="mdi-domain" size="16" class="mr-1"></v-icon>
                                            {{ employment.organisationUnitName ? returnCurrentLocaleContent(employment.organisationUnitName) : returnCurrentLocaleContent(employment.affiliationStatement) }}
                                        </div>
                                    </localized-link>
                                    <div v-else class="font-medium text-gray-900">
                                        {{ employment.organisationUnitName ? returnCurrentLocaleContent(employment.organisationUnitName) : returnCurrentLocaleContent(employment.affiliationStatement) }}
                                    </div>
                                    <div v-if="employment.employmentPosition" class="text-sm text-gray-600">
                                        {{ getEmploymentPositionTitleFromValueAutoLocale(employment.employmentPosition) }}
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

import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import { getTitleFromValueAutoLocale } from '@/i18n/sex';
import type { Employment } from '@/models/InvolvementModel';
import type { PersonResponse } from '@/models/PersonModel';
import { Sex } from '@/models/PersonModel';
import PersonProfileImage from '@/components/person/PersonProfileImage.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';

interface Props {
    person: PersonResponse | undefined;
    researcherName: string;
    employments: Employment[];
    canEdit: boolean;
    researchArea?: any;
    countryName?: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

const showDetails = ref(false);
const activeTab = ref('personal');

const tabs = computed(() => [
    { id: 'personal', name: t('allDetailsLabel') },
]);

const primaryEmployment = computed(() => {
    return props.employments.length > 0 ? props.employments[0] : null;
});

const activeEmployments = computed(() => {
    return props.employments.filter(employment => !employment.dateTo);
});

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('sr-RS');
    } catch {
        return dateString;
    }
};

const formatSex = (sex: Sex | null | undefined): string => {
    if (!sex) return "-";
    return getTitleFromValueAutoLocale(sex) || "-";
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
