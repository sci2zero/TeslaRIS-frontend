import { computed, onMounted, ref } from 'vue';
import CrisContextInformationService from '@/services/CrisContextInformationService';
import type { CrisContextInformation } from '@/models/Common';
import { License } from '@/models/DocumentFileModel';


// Module level so every consumer shares one copy. Each mounting component still
// refetches, so a change made by an admin is picked up without a page reload.
const crisContextInformation = ref<CrisContextInformation>({
    toggleAssessmentModule: true,
    toggleDigitalLibrary: true,
    toggleDigitalRepository: true,
    personNationalIdRegularExpression: ".*",
    projectNationalIdRegularExpression: ".*",
    organisationUnitNationalIdRegularExpression: ".*",
    documentNationalIdRegularExpression: ".*",
    metadataLicense: License.CC0
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

    const personNationalIdPattern = computed(() => crisContextInformation.value.personNationalIdRegularExpression);
    const projectNationalIdPattern = computed(() => crisContextInformation.value.projectNationalIdRegularExpression);
    const organisationUnitNationalIdPattern = computed(() => crisContextInformation.value.organisationUnitNationalIdRegularExpression);
    const documentNationalIdPattern = computed(() => crisContextInformation.value.documentNationalIdRegularExpression);
    const metadataLicense = computed(() => crisContextInformation.value.metadataLicense);

    onMounted(fetchCrisContextInformation);

    return {
        crisContextInformation, loaded, fetchCrisContextInformation,
        isAssessmentModuleEnabled, isDigitalLibraryEnabled, isDigitalRepositoryEnabled,
        personNationalIdPattern, projectNationalIdPattern,
        organisationUnitNationalIdPattern, documentNationalIdPattern, metadataLicense
    };
}
