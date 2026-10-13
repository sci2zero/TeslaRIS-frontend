import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CrisContextInformationService from '@/services/CrisContextInformationService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { ApplicableEntityType, CrisContextInformation } from '@/models/Common';
import { License } from '@/models/DocumentFileModel';


// Module level so every consumer shares one copy. Each mounting component still
// refetches, so a change made by an admin is picked up without a page reload.
const crisContextInformation = ref<CrisContextInformation>({
    toggleAssessmentModule: true,
    toggleDigitalLibrary: true,
    toggleDigitalRepository: true,
    toggleRegistration: false,
    personNationalIdRegularExpression: ".*",
    projectNationalIdRegularExpression: ".*",
    organisationUnitNationalIdRegularExpression: ".*",
    documentNationalIdRegularExpression: ".*",
    metadataLicense: License.CC0,
    identifierConfiguration: {},
    nationalIdentifierName: [],
    personNationalIdUrl: "",
    organisationUnitNationalIdUrl: "",
    projectNationalIdUrl: "",
    documentNationalIdUrl: "",
    orcidLoginToggle: false
});
const loaded = ref(false);

// Read-only accessor for code that needs the configuration but must not trigger
// a fetch of its own, such as the shared validation rules.
export const crisContextInformationState = crisContextInformation;

export const fetchCrisContextInformation = async () => {
    try {
        const response = await CrisContextInformationService.fetchConfigurationForSystem();
        crisContextInformation.value = response.data;
        loaded.value = true;
    } catch (error) {
        console.error("Failed to fetch CRIS context information:", error);
    }
};

export function useCrisContextInformation() {
    const isAssessmentModuleEnabled = computed(() => crisContextInformation.value.toggleAssessmentModule);
    const isDigitalLibraryEnabled = computed(() => crisContextInformation.value.toggleDigitalLibrary);
    const isDigitalRepositoryEnabled = computed(() => crisContextInformation.value.toggleDigitalRepository);
    const isRegistrationEnabled = computed(() => crisContextInformation.value.toggleRegistration);
    const isOrcidLoginEnabled = computed(() => crisContextInformation.value.orcidLoginToggle);

    const personNationalIdPattern = computed(() => crisContextInformation.value.personNationalIdRegularExpression);
    const projectNationalIdPattern = computed(() => crisContextInformation.value.projectNationalIdRegularExpression);
    const organisationUnitNationalIdPattern = computed(() => crisContextInformation.value.organisationUnitNationalIdRegularExpression);
    const documentNationalIdPattern = computed(() => crisContextInformation.value.documentNationalIdRegularExpression);
    const metadataLicense = computed(() => crisContextInformation.value.metadataLicense);

    const identifierConfiguration = computed(
        () => crisContextInformation.value.identifierConfiguration ?? {});
    const nationalIdentifierName = computed(
        () => crisContextInformation.value.nationalIdentifierName ?? []);

    const personNationalIdUrl = computed(
        () => crisContextInformation.value.personNationalIdUrl ?? "");
    const organisationUnitNationalIdUrl = computed(
        () => crisContextInformation.value.organisationUnitNationalIdUrl ?? "");
    const projectNationalIdUrl = computed(
        () => crisContextInformation.value.projectNationalIdUrl ?? "");
    const documentNationalIdUrl = computed(
        () => crisContextInformation.value.documentNationalIdUrl ?? "");

    onMounted(fetchCrisContextInformation);

    return {
        crisContextInformation, loaded, fetchCrisContextInformation,
        isAssessmentModuleEnabled, isDigitalLibraryEnabled, isDigitalRepositoryEnabled,
        isRegistrationEnabled, isOrcidLoginEnabled,
        personNationalIdPattern, projectNationalIdPattern,
        organisationUnitNationalIdPattern, documentNationalIdPattern, metadataLicense,
        identifierConfiguration, nationalIdentifierName,
        personNationalIdUrl, organisationUnitNationalIdUrl, projectNationalIdUrl,
        documentNationalIdUrl
    };
}

/**
 * The configured name of the national identifier, or an empty string when this deployment did not
 * configure one, in which case callers keep their own label.
 */
export function useNationalIdentifierLabel() {
    const { locale } = useI18n();

    const configuredNationalIdentifierLabel = computed(() => {
        // Read so that the label recomputes on a language switch.
        const _activeLocale = locale.value;

        return returnCurrentLocaleContent(
            crisContextInformation.value.nationalIdentifierName) ?? "";
    });

    return { configuredNationalIdentifierLabel };
}

/**
 * Whether an identifier may be edited in the submission and update forms of its entity, which is
 * a display rule only, as the API still accepts it.
 */
export function useIdentifierConfiguration() {
    const canBeUpdated = (entityType: ApplicableEntityType, identifier: string): boolean =>
        crisContextInformationState.value.identifierConfiguration?.[entityType]?.[identifier]
            ?.canBeUpdated ?? true;

    /**
     * Whether a landing page shows the identifier at all, which it does when the identifier is set
     * and otherwise only when the deployment wants the gap to be visible.
     */
    const isIdentifierShown = (entityType: ApplicableEntityType, identifier: string,
        value?: string | null): boolean =>
        !!value ||
        !(crisContextInformationState.value.identifierConfiguration?.[entityType]?.[identifier]
            ?.hideWhenNotSet ?? true);

    return { canBeUpdated, isIdentifierShown };
}
