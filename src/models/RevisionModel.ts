import type { MultilingualContent, Pair } from "./Common";


export enum IssueSeverity {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}

export interface QualityReportResponse {
    profileName: string;
    report: Pair<IssueSeverity, MultilingualContent[]>[];
}
