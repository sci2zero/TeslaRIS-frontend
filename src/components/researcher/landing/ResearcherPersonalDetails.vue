<template>
    <div class="edit-pen-container relative">
        <generic-crud-modal
            :form-component="PersonUpdateForm"
            :form-props="{ presetPerson: person }"
            entity-name="Person"
            is-update
            is-section-update
            primary-color outlined
            :read-only="!canEdit"
            @update="emit('update', $event)"
        />
        <div class="space-y-6">
            <div class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-account-circle mr-2 text-blue-600"></span>
                    {{ t('personalInfoLabel') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('firstNameLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person?.personName?.firstname }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('surnameLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person?.personName?.lastname }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('birthdateLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ (((isResearcher || isAdmin) && canEdit) || person?.showFullBirthdate) ? formatDate(person?.personalInfo?.localBirthDate) : person?.personalInfo?.localBirthDate?.slice(0, 4) }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('placeOfBirthLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person?.personalInfo?.placeOfBirth || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('sexLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ formatSex(person?.personalInfo?.sex) }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="person?.personalInfo?.postalAddress" class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-map-marker mr-2 text-red-600"></span>
                    {{ t('professionalAddressLabel') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('streetAndNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ returnCurrentLocaleContent(person.personalInfo.postalAddress.streetAndNumber) || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('cityLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ returnCurrentLocaleContent(person.personalInfo.postalAddress.city) || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('stateLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ returnCurrentLocaleContent(person.personalInfo.postalAddress.state) || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('postalNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.postalAddress.postalNumber || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('countryLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ countryName || '-' }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="person?.personalInfo?.privatePostalAddress" class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-map-marker mr-2 text-red-600"></span>
                    {{ t('privateAddressLabel') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('streetAndNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ returnCurrentLocaleContent(person.personalInfo.privatePostalAddress.streetAndNumber) || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('cityLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ returnCurrentLocaleContent(person.personalInfo.privatePostalAddress.city) || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('stateLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ returnCurrentLocaleContent(person.personalInfo.privatePostalAddress.state) || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('postalNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.privatePostalAddress.postalNumber || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('countryLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ privateCountryName || '-' }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="person?.personalInfo?.contact" class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-phone mr-2 text-green-600"></span>
                    {{ t('professionalContactLabel') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('emailLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.contact.contactEmail || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('phoneNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.contact.phoneNumber || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('faxNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.contact.faxNumber || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('mobilePhoneNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.contact.mobilePhoneNumber || '-' }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="person?.personalInfo?.privateContact" class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-phone mr-2 text-green-600"></span>
                    {{ t('privateContactLabel') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('emailLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.privateContact.contactEmail || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('phoneNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.privateContact.phoneNumber || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('faxNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.privateContact.faxNumber || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('mobilePhoneNumberLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person.personalInfo.privateContact.mobilePhoneNumber || '-' }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="researchArea" class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-domain mr-2 text-purple-600"></span>
                    {{ t('researchAreaLabel') }}
                </h3>
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t('researchAreaLabel') }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ returnCurrentLocaleContent(researchArea.name) }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-identifier mr-2 text-indigo-600"></span>
                    {{ t('identifiersLabel') }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">APVNT</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person?.personalInfo?.apvnt || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">eCRIS-ID</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            <identifier-link v-if="person?.personalInfo.eCrisId" :identifier="person?.personalInfo.eCrisId" type="ecris"></identifier-link>
                            <span v-else>-</span>
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">enaukaID</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person?.personalInfo?.eNaukaId || '-' }}
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">{{ t("nationalScienceIdLabel") }}</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            {{ person?.personalInfo?.nationalScienceId || '-' }}
                        </p>
                    </div>
                    <div v-if="person?.personalInfo?.orcid">
                        <label class="block text-sm font-medium text-gray-700">ORCID</label>
                        <identifier-link v-if="person?.personalInfo.orcid" :identifier="person?.personalInfo.orcid" type="orcid"></identifier-link>
                        <span v-else>-</span>
                    </div>
                    <div v-if="person?.personalInfo?.scopusAuthorId">
                        <label class="block text-sm font-medium text-gray-700">Scopus Author ID</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            <identifier-link v-if="person?.personalInfo.scopusAuthorId" :identifier="person?.personalInfo.scopusAuthorId" type="scopus_author"></identifier-link>
                            <span v-else>-</span>
                        </p>
                    </div>
                    <div v-if="person?.personalInfo?.openAlexId">
                        <label class="block text-sm font-medium text-gray-700">OpenAlex ID</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            <identifier-link v-if="person?.personalInfo.openAlexId" :identifier="person?.personalInfo.openAlexId" type="open_alex"></identifier-link>
                            <span v-else>-</span>
                        </p>
                    </div>
                    <div v-if="person?.personalInfo?.webOfScienceResearcherId">
                        <label class="block text-sm font-medium text-gray-700">ResearcherID (WoS)</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            <identifier-link v-if="person?.personalInfo.webOfScienceResearcherId" :identifier="person?.personalInfo.webOfScienceResearcherId" type="researcher_id"></identifier-link>
                            <span v-else>-</span>
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Google Scholar ID</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            <identifier-link v-if="person?.personalInfo.scholarId" :identifier="person?.personalInfo.scholarId" type="scholar"></identifier-link>
                            <span v-else>-</span>
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Authenticus ID</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            <identifier-link v-if="person?.personalInfo.authenticusId" :identifier="person?.personalInfo.authenticusId" type="authenticus"></identifier-link>
                            <span v-else>-</span>
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Lattes ID</label>
                        <p class="mt-1 text-sm text-gray-900 break-words">
                            <identifier-link v-if="person?.personalInfo.lattesId" :identifier="person?.personalInfo.lattesId" type="lattes"></identifier-link>
                            <span v-else>-</span>
                        </p>
                    </div>
                    <div>
                        <entity-identifiers-list
                            :entity-identifiers="personIdentifiers"
                            :can-edit="canEdit"
                            :entity-id="person?.id"
                            :containing-entity-type="ApplicableEntityType.PERSON"
                            :concrete-entity-type="ApplicableEntityType.PERSON"
                            @updated="fetchIdentifiers"
                        />
                    </div>
                </div>
            </div>

            <div v-if="person?.personalInfo?.uris && person.personalInfo.uris.length > 0" class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="mdi mdi-web mr-2 text-blue-600"></span>
                    {{ t('websiteLabel') }}
                </h3>
                <div class="space-y-2">
                    <div v-for="uri in person.personalInfo.uris" :key="uri" class="flex items-start min-w-0">
                        <span class="mdi mdi-link text-gray-400 mr-2 mt-0.5 shrink-0"></span>
                        <a :href="uri" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm underline break-all">
                            {{ uri }}
                        </a>
                    </div>
                </div>
            </div>

            <div v-if="activeEmployments.length > 0" class="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
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
                                {{ employment.organisationUnitName ? returnCurrentLocaleContent(employment.organisationUnitName) : returnCurrentLocaleContent(employment.displayOrganisationUnit) }}
                            </div>
                        </localized-link>
                        <div v-else class="font-medium text-gray-900">
                            {{ employment.organisationUnitName ? returnCurrentLocaleContent(employment.organisationUnitName) : returnCurrentLocaleContent(employment.displayOrganisationUnit) }}
                        </div>
                        <div v-if="employment.employmentPosition" class="text-sm text-gray-600">
                            {{ getEmploymentPositionTitleFromValueAutoLocale(employment.employmentPosition) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import PersonUpdateForm from "@/components/person/update/PersonUpdateForm.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getEmploymentPositionTitleFromValueAutoLocale } from "@/i18n/employmentPosition";
import { getTitleFromValueAutoLocale } from "@/i18n/sex";
import type { AssessmentResearchArea } from "@/models/AssessmentModel";
import type { Employment } from "@/models/InvolvementModel";
import type { PersonalInfo, PersonResponse } from "@/models/PersonModel";
import { Sex } from "@/models/PersonModel";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import IdentifierLink from "@/components/core/IdentifierLink.vue";
import { useUserRole } from "@/composables/useUserRole";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import { ApplicableEntityType } from "@/models/Common";
import type { EntityIdentifierResponse } from "@/models/IdentifierModel";
import EntityIdentifierService from "@/services/EntityIdentifierService";
import EntityIdentifiersList from "@/components/core/identifiers/EntityIdentifiersList.vue";

interface Props {
    person: PersonResponse | undefined;
    employments: Employment[];
    canEdit: boolean;
    researchArea?: AssessmentResearchArea;
    countryName?: string;
    privateCountryName?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: "update", personalInfo: PersonalInfo): void;
}>();

const { t } = useI18n();
const { isResearcher, isAdmin } = useUserRole();
const personIdentifiers = ref<EntityIdentifierResponse[]>([]);

const activeEmployments = computed(() =>
    props.employments.filter(employment => !employment.dateTo)
);

const fetchIdentifiers = () => {
    if (!props.person?.id) {
        return;
    }

    EntityIdentifierService.fetchPersonIdentifiers(
        props.person.id
    ).then(response => {
        personIdentifiers.value = response.data;
    });
};

watch(
    () => props.person?.id,
    (id) => {
        if (id) {
            fetchIdentifiers();
        }
    },
    { immediate: true }
);

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("sr-RS");
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
.edit-pen-container :deep(.edit-pen) {
    top: 0;
    right: 0;
    position: absolute;
    z-index: 10;
    opacity: 0;
}

.edit-pen-container:hover :deep(.edit-pen) {
    opacity: 0.3;
}

.edit-pen-container :deep(.edit-pen:hover) {
    opacity: 1;
}

@media (hover: none), (max-width: 768px) {
    .edit-pen-container :deep(.edit-pen) {
        opacity: 1;
    }
}
</style>

