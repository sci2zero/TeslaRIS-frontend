import { ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { DocumentChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel'
import ChartDisplayConfigurationService from '@/services/visualization/ChartDisplayConfigurationService'


export function useDocumentChartDisplay(documentId: Ref<number> | number) {
    const displaySettings = ref<DocumentChartDisplaySettings>();
    const loading = ref(false);
    const error = ref<string | null>(null);

    const loadDisplaySettings = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ChartDisplayConfigurationService.getChartDisplaySettingsForDocument(id);
            displaySettings.value = response.data;
        } finally {
            loading.value = false;
        }
    };

    watchEffect(() => {
        const id = typeof documentId === 'number' ? documentId : documentId.value;
        if (id) {
            loadDisplaySettings(id);
        }
    });

    const shouldDisplayStatisticsTab = () => {
        if (!displaySettings.value) return false
        
        const settings = displaySettings.value
        return settings.viewCountTotal.display ||
            settings.viewCountByMonth.display ||
            settings.viewCountByCountry.display ||
            settings.downloadCountTotal.display ||
            settings.downloadCountByMonth.display ||
            settings.downloadCountByCountry.display
    };

    const shouldDisplayViewCountTotal = () => displaySettings.value?.viewCountTotal.display ?? false;
    const shouldDisplayViewCountByMonth = () => displaySettings.value?.viewCountByMonth.display ?? false;
    const shouldDisplayViewCountByCountry = () => displaySettings.value?.viewCountByCountry.display ?? false;
    const shouldDisplayDownloadCountTotal = () => displaySettings.value?.downloadCountTotal.display ?? false;
    const shouldDisplayDownloadCountByMonth = () => displaySettings.value?.downloadCountByMonth.display ?? false;
    const shouldDisplayDownloadCountByCountry = () => displaySettings.value?.downloadCountByCountry.display ?? false;

    return {
        displaySettings, loading,
        loadDisplaySettings, error,
        shouldDisplayStatisticsTab,
        shouldDisplayViewCountTotal,
        shouldDisplayViewCountByMonth,
        shouldDisplayViewCountByCountry,
        shouldDisplayDownloadCountTotal,
        shouldDisplayDownloadCountByMonth,
        shouldDisplayDownloadCountByCountry
    };
}
