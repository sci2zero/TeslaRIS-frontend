<template>
    <div class="space-y-4">
        <landing-section-card
            :title="t('personalInfoLabel')"
            icon="mdi-account-circle"
            icon-class="bg-blue-50 text-blue-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <template v-if="canEdit" #action>
                <generic-crud-modal
                    :form-component="PersonUpdateForm"
                    :form-props="{ presetPerson: person }"
                    entity-name="Person"
                    is-update
                    is-section-update
                    primary-color outlined
                    :read-only="!canEdit"
                    @update="emit('update', $event)"
                >
                    <template #activator="{ props: activatorProps }">
                        <v-btn
                            v-bind="activatorProps"
                            variant="outlined" size="small" class="text-none"
                            prepend-icon="mdi-pencil-outline">
                            {{ t("updatePersonLabel") }}
                        </v-btn>
                    </template>
                </generic-crud-modal>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field :label="t('firstNameLabel')" class="min-w-0 break-words">
                    {{ person?.personName?.firstname }}
                </landing-detail-field>
                <landing-detail-field :label="t('surnameLabel')" class="min-w-0 break-words">
                    {{ person?.personName?.lastname }}
                </landing-detail-field>
                <landing-detail-field :label="t('birthdateLabel')" class="min-w-0 break-words">
                    {{ (((isResearcher || isAdmin) && canEdit) || person?.showFullBirthdate) ? formatDate(person?.personalInfo?.localBirthDate) : person?.personalInfo?.localBirthDate?.slice(0, 4) }}
                </landing-detail-field>
                <landing-detail-field :label="t('placeOfBirthLabel')" class="min-w-0 break-words">
                    {{ person?.personalInfo?.placeOfBirth || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('sexLabel')" class="min-w-0 break-words">
                    {{ formatSex(person?.personalInfo?.sex) }}
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="person?.personalInfo?.postalAddress"
            :title="t('professionalAddressLabel')"
            icon="mdi-map-marker"
            icon-class="bg-red-50 text-red-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field :label="t('streetAndNumberLabel')" class="min-w-0 break-words">
                    {{ returnCurrentLocaleContent(person.personalInfo.postalAddress.streetAndNumber) || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('cityLabel')" class="min-w-0 break-words">
                    {{ returnCurrentLocaleContent(person.personalInfo.postalAddress.city) || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('stateLabel')" class="min-w-0 break-words">
                    {{ returnCurrentLocaleContent(person.personalInfo.postalAddress.state) || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('postalNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.postalAddress.postalNumber || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('countryLabel')" class="min-w-0 break-words">
                    {{ countryName || '-' }}
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="person?.personalInfo?.privatePostalAddress"
            :title="t('privateAddressLabel')"
            icon="mdi-map-marker"
            icon-class="bg-red-50 text-red-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field :label="t('streetAndNumberLabel')" class="min-w-0 break-words">
                    {{ returnCurrentLocaleContent(person.personalInfo.privatePostalAddress.streetAndNumber) || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('cityLabel')" class="min-w-0 break-words">
                    {{ returnCurrentLocaleContent(person.personalInfo.privatePostalAddress.city) || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('stateLabel')" class="min-w-0 break-words">
                    {{ returnCurrentLocaleContent(person.personalInfo.privatePostalAddress.state) || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('postalNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.privatePostalAddress.postalNumber || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('countryLabel')" class="min-w-0 break-words">
                    {{ privateCountryName || '-' }}
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="person?.personalInfo?.contact"
            :title="t('professionalContactLabel')"
            icon="mdi-phone"
            icon-class="bg-green-50 text-green-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field :label="t('emailLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.contact.contactEmail || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('phoneNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.contact.phoneNumber || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('faxNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.contact.faxNumber || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('mobilePhoneNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.contact.mobilePhoneNumber || '-' }}
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="person?.personalInfo?.privateContact"
            :title="t('privateContactLabel')"
            icon="mdi-phone"
            icon-class="bg-green-50 text-green-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field :label="t('emailLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.privateContact.contactEmail || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('phoneNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.privateContact.phoneNumber || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('faxNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.privateContact.faxNumber || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('mobilePhoneNumberLabel')" class="min-w-0 break-words">
                    {{ person.personalInfo.privateContact.mobilePhoneNumber || '-' }}
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="researchArea"
            :title="t('researchAreaLabel')"
            icon="mdi-domain"
            icon-class="bg-purple-50 text-purple-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="grid grid-cols-1 gap-4">
                <landing-detail-field :label="t('researchAreaLabel')" class="min-w-0 break-words">
                    {{ returnCurrentLocaleContent(researchArea.name) }}
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            :title="t('identifiersLabel')"
            icon="mdi-identifier"
            icon-class="bg-indigo-50 text-indigo-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field label="APVNT" class="min-w-0 break-words">
                    {{ person?.personalInfo?.apvnt || '-' }}
                </landing-detail-field>
                <landing-detail-field label="eCRIS-ID" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.eCrisId" :identifier="person?.personalInfo.eCrisId" type="ecris" />
                    <span v-else>-</span>
                </landing-detail-field>
                <landing-detail-field label="enaukaID" class="min-w-0 break-words">
                    {{ person?.personalInfo?.eNaukaId || '-' }}
                </landing-detail-field>
                <landing-detail-field :label="t('nationalScienceIdLabel')" class="min-w-0 break-words">
                    {{ person?.personalInfo?.nationalScienceId || '-' }}
                </landing-detail-field>
                <landing-detail-field v-if="person?.personalInfo?.orcid" label="ORCID" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.orcid" :identifier="person?.personalInfo.orcid" type="orcid" />
                    <span v-else>-</span>
                </landing-detail-field>
                <landing-detail-field v-if="person?.personalInfo?.scopusAuthorId" label="Scopus Author ID" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.scopusAuthorId" :identifier="person?.personalInfo.scopusAuthorId" type="scopus_author" />
                    <span v-else>-</span>
                </landing-detail-field>
                <landing-detail-field v-if="person?.personalInfo?.openAlexId" label="OpenAlex ID" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.openAlexId" :identifier="person?.personalInfo.openAlexId" type="open_alex" />
                    <span v-else>-</span>
                </landing-detail-field>
                <landing-detail-field v-if="person?.personalInfo?.webOfScienceResearcherId" label="ResearcherID (WoS)" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.webOfScienceResearcherId" :identifier="person?.personalInfo.webOfScienceResearcherId" type="researcher_id" />
                    <span v-else>-</span>
                </landing-detail-field>
                <landing-detail-field label="Google Scholar ID" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.scholarId" :identifier="person?.personalInfo.scholarId" type="scholar" />
                    <span v-else>-</span>
                </landing-detail-field>
                <landing-detail-field label="Authenticus ID" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.authenticusId" :identifier="person?.personalInfo.authenticusId" type="authenticus" />
                    <span v-else>-</span>
                </landing-detail-field>
                <landing-detail-field label="Lattes ID" class="min-w-0 break-words">
                    <identifier-link v-if="person?.personalInfo.lattesId" :identifier="person?.personalInfo.lattesId" type="lattes" />
                    <span v-else>-</span>
                </landing-detail-field>
                <div class="md:col-span-2">
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
        </landing-section-card>

        <landing-section-card
            v-if="person?.personalInfo?.uris && person.personalInfo.uris.length > 0"
            :title="t('websiteLabel')"
            icon="mdi-web"
            icon-class="bg-blue-50 text-blue-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="space-y-2">
                <div v-for="uri in person.personalInfo.uris" :key="uri" class="flex items-start min-w-0">
                    <span class="mdi mdi-link text-gray-400 mr-2 mt-0.5 shrink-0" />
                    <a :href="uri" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm underline break-all">
                        {{ uri }}
                    </a>
                </div>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="activeEmployments.length > 0"
            :title="t('employmentsLabel')"
            icon="mdi-office-building"
            icon-class="bg-orange-50 text-orange-600"
            class="min-w-0 [&>header]:flex-wrap"
            padded>
            <div class="space-y-3">
                <div v-for="employment in activeEmployments.slice(0, 5)" :key="employment.id" class="border-l-4 border-orange-200 pl-4">
                    <localized-link
                        v-if="employment.organisationUnitId"
                        :to="'organisation-units/' + employment.organisationUnitId"
                        class="font-medium text-gray-900 underline"
                    >
                        <div class="font-medium text-gray-900">
                            <v-icon icon="mdi-domain" size="16" class="mr-1" />
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
        </landing-section-card>
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
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import LandingDetailField from "@/components/landing/LandingDetailField.vue";
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
