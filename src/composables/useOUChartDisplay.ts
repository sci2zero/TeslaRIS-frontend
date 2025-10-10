import { ref, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { OUChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel'
import ChartDisplayConfigurationService from '@/services/visualization/ChartDisplayConfigurationService'


export function useOUChartDisplay(organisationUnitId: Ref<number> | number) {
    const displaySettings = ref<OUChartDisplaySettings>();
    const loading = ref(false);
    const error = ref<string | null>(null);

    const loadDisplaySettings = async (id: number) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ChartDisplayConfigurationService.getChartDisplaySettingsForOrganisationUnit(id);
            displaySettings.value = response.data;
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

    const shouldDisplayPublicationLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value
        return settings.publicationCountPersonLeaderboard.display ||
            settings.publicationCountSubUnitLeaderboard.display;
    };

    const shouldDisplayCitationLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value
        return settings.citationCountPersonLeaderboard.display ||
            settings.citationCountSubUnitLeaderboard.display;
    };

    const shouldDisplayAssessmentPointsLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        const settings = displaySettings.value
        return settings.assessmentPointPersonLeaderboard.display ||
            settings.assessmentPointSubUnitLeaderboard.display;
    };

    const shouldDisplayLeaderboards = () => {
        if (!displaySettings.value) return false;
        
        return shouldDisplayPublicationLeaderboards() ||
            shouldDisplayCitationLeaderboards() ||
            shouldDisplayAssessmentPointsLeaderboards;
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
        shouldDisplayPublicationLeaderboards,
        shouldDisplayCitationLeaderboards,
        shouldDisplayAssessmentPointsLeaderboards,
        shouldDisplayLeaderboards, shouldDisplayVisualisations
    };
}
