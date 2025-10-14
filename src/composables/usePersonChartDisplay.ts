import { ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { PersonChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel'
import ChartDisplayConfigurationService from '@/services/visualization/ChartDisplayConfigurationService'


export function usePersonChartDisplay(personId: Ref<number> | number) {
    const displaySettings = ref<PersonChartDisplaySettings>();
    const loading = ref(false);
    const error = ref<string | null>(null);

    const loadDisplaySettings = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ChartDisplayConfigurationService.getChartDisplaySettingsForPerson(id);
            displaySettings.value = response.data;
        } finally {
            loading.value = false;
        }
    };

    watchEffect(() => {
        const id = typeof personId === 'number' ? personId : personId.value;
        if (id) {
            loadDisplaySettings(id);
        }
    });

    const shouldDisplayPublicationTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value
        return settings.publicationCountTotal.display ||
            settings.publicationCountByYear.display ||
            settings.publicationTypeByYear.display ||
            settings.publicationCategoryByYear.display;
    };

    const shouldDisplayTypeTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value
        return settings.publicationTypeRatio.display ||
            settings.publicationCategoryRatio.display;
    };

    const shouldDisplayStatisticsTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value
        return settings.viewCountTotal.display ||
            settings.viewCountByMonth.display ||
            settings.viewCountByCountry.display;
    };

    const shouldDisplayCitationsTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value
        return settings.citationCountTotal.display ||
            settings.citationCountByYear.display;
    };

    const shouldDisplayVisualisations = () => {
        if (!displaySettings.value) return false;
        
        return shouldDisplayPublicationTab() ||
            shouldDisplayTypeTab() ||
            shouldDisplayStatisticsTab();
    };

    return {
        displaySettings, loading, error,
        loadDisplaySettings, shouldDisplayStatisticsTab,
        shouldDisplayPublicationTab, shouldDisplayTypeTab,
        shouldDisplayCitationsTab, shouldDisplayVisualisations
    };
}
