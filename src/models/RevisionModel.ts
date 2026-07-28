import type { MultilingualContent, Pair } from "./Common";


export enum IssueSeverity {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}

export interface QualityReportResponse {
    profileName: string;
    qualityScore: number;
    issueCount: number;
    assessmentDate: string;
    publicationCandidate: boolean;
    report: Pair<IssueSeverity, MultilingualContent[]>[];
}
