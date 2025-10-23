export interface ChartDisplaySettings {
    display: boolean;
    spanWholeRow: boolean;
}

export interface BaseChartDisplaySettings {
    publicationCountTotal: ChartDisplaySettings;
    publicationCountByYear: ChartDisplaySettings;
    publicationTypeByYear: ChartDisplaySettings;
    publicationCategoryByYear: ChartDisplaySettings;
    publicationTypeRatio: ChartDisplaySettings;
    publicationCategoryRatio: ChartDisplaySettings;
    citationCountTotal: ChartDisplaySettings;
    citationCountByYear: ChartDisplaySettings;
    viewCountTotal: ChartDisplaySettings;
    viewCountByMonth: ChartDisplaySettings;
    viewCountByCountry: ChartDisplaySettings;
}

export interface DocumentChartDisplaySettings {
    viewCountTotal: ChartDisplaySettings;
    viewCountByMonth: ChartDisplaySettings;
    downloadCountTotal: ChartDisplaySettings;
    downloadCountByMonth: ChartDisplaySettings;
    viewCountByCountry: ChartDisplaySettings;
    downloadCountByCountry: ChartDisplaySettings;
}

export interface OUChartDisplaySettings extends BaseChartDisplaySettings {
    publicationCountPersonLeaderboard: ChartDisplaySettings;
    publicationCountSubUnitLeaderboard: ChartDisplaySettings;
    citationCountPersonLeaderboard: ChartDisplaySettings;
    citationCountSubUnitLeaderboard: ChartDisplaySettings;
    assessmentPointPersonLeaderboard: ChartDisplaySettings;
    assessmentPointSubUnitLeaderboard: ChartDisplaySettings;
    viewCountPersonLeaderboard: ChartDisplaySettings;
    viewCountDocumentLeaderboard: ChartDisplaySettings;
    downloadCountDocumentLeaderboard: ChartDisplaySettings;
    citationCountDocumentLeaderboard: ChartDisplaySettings;
}

export interface PersonChartDisplaySettings extends BaseChartDisplaySettings {
}

export interface DigitalLibraryChartDisplaySettings {
    thesisCountTotal: ChartDisplaySettings;
    thesisCountByYear: ChartDisplaySettings;
    thesisTypeByYear: ChartDisplaySettings;
    thesisTypeRatio: ChartDisplaySettings;
    thesisViewCountTotal: ChartDisplaySettings;
    thesisViewCountByMonth: ChartDisplaySettings;
    thesisViewCountByCountry: ChartDisplaySettings;
    thesisDownloadCountTotal: ChartDisplaySettings;
    thesisDownloadCountByMonth: ChartDisplaySettings;
    thesisDownloadCountByCountry: ChartDisplaySettings;
    viewCountThesisLeaderboard: ChartDisplaySettings;
    downloadCountThesisLeaderboard: ChartDisplaySettings;
}

export interface FullChartDisplaySettings {
    personChartDisplaySettings: PersonChartDisplaySettings;
    ouChartDisplaySettings: OUChartDisplaySettings;
    documentChartDisplaySettings: DocumentChartDisplaySettings;
    digitalLibraryChartDisplaySettings: DigitalLibraryChartDisplaySettings;
}
