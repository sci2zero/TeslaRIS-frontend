import { ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { DigitalLibraryChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel'
import ChartDisplayConfigurationService from '@/services/visualization/ChartDisplayConfigurationService'

export function useDLChartDisplay(organisationUnitId: Ref<number> | number) {
    const displaySettings = ref<DigitalLibraryChartDisplaySettings>();
    const loading = ref(false);
    const error = ref<string | null>(null);

    const loadDisplaySettings = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ChartDisplayConfigurationService.getChartDisplaySettingsForDigitalLibrary(id);
            displaySettings.value = response.data;
        } catch (err) {
            error.value = 'Failed to load display settings';
            console.error('Error loading digital library chart display settings:', err);
        } finally {
            loading.value = false;
        }
    };

    watchEffect(() => {
        const id = typeof organisationUnitId === 'number' ? organisationUnitId : organisationUnitId.value;
        if (id) {
            loadDisplaySettings(id);
        }
    });

    const shouldDisplayThesisTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.thesisCountTotal.display ||
            settings.thesisCountByYear.display ||
            settings.thesisTypeByYear.display;
    };

    const shouldDisplayThesisTypeTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.thesisTypeRatio.display;
    };

    const shouldDisplayThesisStatisticsTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.thesisViewCountTotal.display ||
            settings.thesisViewCountByMonth.display ||
            settings.thesisViewCountByCountry.display ||
            settings.thesisDownloadCountTotal.display ||
            settings.thesisDownloadCountByMonth.display ||
            settings.thesisDownloadCountByCountry.display;
    };

    const shouldDisplayViewStatisticsTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.thesisViewCountTotal.display ||
            settings.thesisViewCountByMonth.display ||
            settings.thesisViewCountByCountry.display;
    };

    const shouldDisplayDownloadStatisticsTab = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.thesisDownloadCountTotal.display ||
            settings.thesisDownloadCountByMonth.display ||
            settings.thesisDownloadCountByCountry.display;
    };

    const shouldDisplayThesisLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.viewCountThesisLeaderboard.display ||
            settings.downloadCountThesisLeaderboard.display;
    };

    const shouldDisplayViewLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.viewCountThesisLeaderboard.display;
    };

    const shouldDisplayDownloadLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return settings.downloadCountThesisLeaderboard.display;
    };

    const shouldDisplayLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        return shouldDisplayThesisLeaderboards();
    };

    const shouldDisplayVisualisations = () => {
        if (!displaySettings.value) return false;
        
        return shouldDisplayThesisTab() ||
            shouldDisplayThesisTypeTab() ||
            shouldDisplayThesisStatisticsTab();
    };

    const shouldDisplayAnyThesisChart = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value;
        return Object.values(settings).some(chart => chart.display);
    };

    // Individual chart display checkers for more granular control
    const shouldDisplayThesisCountTotal = () => {
        return displaySettings.value?.thesisCountTotal.display ?? false;
    };

    const shouldDisplayThesisCountByYear = () => {
        return displaySettings.value?.thesisCountByYear.display ?? false;
    };

    const shouldDisplayThesisTypeByYear = () => {
        return displaySettings.value?.thesisTypeByYear.display ?? false;
    };

    const shouldDisplayThesisTypeRatio = () => {
        return displaySettings.value?.thesisTypeRatio.display ?? false;
    };

    const shouldDisplayThesisViewCountTotal = () => {
        return displaySettings.value?.thesisViewCountTotal.display ?? false;
    };

    const shouldDisplayThesisViewCountByMonth = () => {
        return displaySettings.value?.thesisViewCountByMonth.display ?? false;
    };

    const shouldDisplayThesisViewCountByCountry = () => {
        return displaySettings.value?.thesisViewCountByCountry.display ?? false;
    };

    const shouldDisplayThesisDownloadCountTotal = () => {
        return displaySettings.value?.thesisDownloadCountTotal.display ?? false;
    };

    const shouldDisplayThesisDownloadCountByMonth = () => {
        return displaySettings.value?.thesisDownloadCountByMonth.display ?? false;
    };

    const shouldDisplayThesisDownloadCountByCountry = () => {
        return displaySettings.value?.thesisDownloadCountByCountry.display ?? false;
    };

    const shouldDisplayViewCountThesisLeaderboard = () => {
        return displaySettings.value?.viewCountThesisLeaderboard.display ?? false;
    };

    const shouldDisplayDownloadCountThesisLeaderboard = () => {
        return displaySettings.value?.downloadCountThesisLeaderboard.display ?? false;
    };

    return {
        // Reactive state
        displaySettings,
        loading,
        error,
        
        // Methods
        loadDisplaySettings,
        
        // Tab-level display checkers
        shouldDisplayThesisTab,
        shouldDisplayThesisTypeTab,
        shouldDisplayThesisStatisticsTab,
        shouldDisplayViewStatisticsTab,
        shouldDisplayDownloadStatisticsTab,
        
        // Leaderboard display checkers
        shouldDisplayThesisLeaderboards,
        shouldDisplayViewLeaderboards,
        shouldDisplayDownloadLeaderboards,
        shouldDisplayLeaderboards,
        
        // Overall display checkers
        shouldDisplayVisualisations,
        shouldDisplayAnyThesisChart,
        
        // Individual chart display checkers
        shouldDisplayThesisCountTotal,
        shouldDisplayThesisCountByYear,
        shouldDisplayThesisTypeByYear,
        shouldDisplayThesisTypeRatio,
        shouldDisplayThesisViewCountTotal,
        shouldDisplayThesisViewCountByMonth,
        shouldDisplayThesisViewCountByCountry,
        shouldDisplayThesisDownloadCountTotal,
        shouldDisplayThesisDownloadCountByMonth,
        shouldDisplayThesisDownloadCountByCountry,
        shouldDisplayViewCountThesisLeaderboard,
        shouldDisplayDownloadCountThesisLeaderboard
    };
}