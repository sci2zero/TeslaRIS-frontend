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

export interface DataQualityAssessmentSimple {
    profileName: string;
    profileVersion: string;
    dataQualityScore: number;
    publicationCandidate: boolean;
    assessmentDate: string;
}

export enum DegradationOutcome {
    DROPPED = "DROPPED",
    DEGRADED = "DEGRADED"
}

export interface DegradedReference {
    messageKey: string;
    fieldPath: string;
    parameters: string[];
    outcome: DegradationOutcome;
}

export interface Revision {
    timestamp: string;
    majorVersion: number;
    minorVersion: number;
    versionNote?: string;
    createdBy?: string;
    assessments: DataQualityAssessmentSimple[];
    restorationWarnings: DegradedReference[];
}
