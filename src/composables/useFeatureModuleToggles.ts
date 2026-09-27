import { computed, onMounted, ref } from 'vue';
import FeatureModuleTogglesService from '@/services/FeatureModuleTogglesService';
import type { FeatureModuleToggles } from '@/models/Common';


export function useFeatureModuleToggles() {
    const featureModuleToggles = ref<FeatureModuleToggles>({
        toggleAssessmentModule: true,
        toggleDigitalLibrary: true,
        toggleDigitalRepository: true
    });
    const loaded = ref(false);

    const isAssessmentModuleEnabled = computed(() => featureModuleToggles.value.toggleAssessmentModule);
    const isDigitalLibraryEnabled = computed(() => featureModuleToggles.value.toggleDigitalLibrary);
    const isDigitalRepositoryEnabled = computed(() => featureModuleToggles.value.toggleDigitalRepository);

    const fetchFeatureModuleToggles = async () => {
        try {
            const response = await FeatureModuleTogglesService.fetchConfigurationForSystem();
            featureModuleToggles.value = response.data;
            loaded.value = true;
        } catch (error) {
            console.error("Failed to fetch feature module toggles:", error);
        }
    };

    onMounted(fetchFeatureModuleToggles);

    return {
        featureModuleToggles, loaded, fetchFeatureModuleToggles,
        isAssessmentModuleEnabled, isDigitalLibraryEnabled, isDigitalRepositoryEnabled
    };
}
