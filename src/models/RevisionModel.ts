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

export enum QualityDimension {
    COMPLETENESS = "COMPLETENESS",
    VALIDITY = "VALIDITY",
    UNIQUENESS = "UNIQUENESS",
    CONSISTENCY = "CONSISTENCY",
    TIMELINESS = "TIMELINESS",
    ACCURACY = "ACCURACY",
    CONFORMITY = "CONFORMITY",
    INTEGRITY = "INTEGRITY"
}

export interface DimensionScore {
    achievedPoints: number;
    totalPoints: number;
    percentage: number;
}

export interface DataQualityRuleResult {
    key: string;
    target: string;
    dimension: QualityDimension;
    severity: IssueSeverity;
    blocking: boolean;
    points: number;
    passed: boolean;
    title: MultilingualContent[];
    message: MultilingualContent[];
    actualValue?: string;
}

export interface DataQualityAssessment {
    assessmentId: number;
    profileName: string;
    profileVersion: string;
    engineVersion: string;
    startedAt: string;
    finishedAt: string;
    valid: boolean;
    qualityScore: number;
    qualityScoreFair: number;
    totalPoints: number;
    totalPointsFair: number;
    achievedPoints: number;
    achievedFairPoints: number;
    passedRules: number;
    warningFailedRules: number;
    errorFailedRules: number;
    dimensionScores: Record<QualityDimension, DimensionScore>;
    passedRulesList: DataQualityRuleResult[];
    failedRulesList: DataQualityRuleResult[];
}

export enum RelatedEntityType {
    OUTPUTS = "OUTPUTS",
    PROJECTS = "PROJECTS",
    ACTIVITIES = "ACTIVITIES",
    FUNDINGS = "FUNDINGS"
}

export interface ProfileRelatedQuality {
    profileName: string;
    profileVersion: string;
    assessmentDate?: string;
    relatedQuality: RelatedQuality[];
}

export interface RelatedQuality {
    entityType: RelatedEntityType;
    linkedRecords: number;
    affectedRecords: number;
    openIssues: number;
    averageScore?: number;
    supported: boolean;
}

export interface DataQualityIssue {
    assessmentId: number;
    entityType: string;
    entityId: number;
    target: string;
    recordMajorVersion: number;
    recordMinorVersion: number;
    assessmentDate: string;
    ruleKey: string;
    dimension: QualityDimension;
    severity: IssueSeverity;
    blocking: boolean;
    title: MultilingualContent[];
    message: MultilingualContent[];
    entityNameSr: string;
    entityNameOther: string;
}

export interface DataQualityRemark {
    title: MultilingualContent[];
    message: MultilingualContent[];
    target: string;
    targetWeight: number;
    severity: IssueSeverity;
    dimension: QualityDimension;
    blocking: boolean;
    points: number;
    usedForFairCompliance: boolean;
}

export interface DataQualityProfile {
    profileName: string;
    version: string;
    dataQualityRemarks: Record<string, DataQualityRemark>;
}

export interface DataQualityIssueOccurrence {
    actualValue: string[];
    message: MultilingualContent[];
}

export interface DataQualityIssueDetails {
    assessmentId: number;
    ruleKey: string;
    entityType: string;
    entityId: number;
    recordMajorVersion: number;
    recordMinorVersion: number;
    assessmentDate: string;
    score: number;
    maximumScore: number;
    occurrences: DataQualityIssueOccurrence[];
    title: MultilingualContent[];
    severity: IssueSeverity;
    targetEntityType: string;
    targetObject: string;
    constraintWeight: number;
    fairRelated: boolean;
    blocking: boolean;
    policy: string;
    policyVersion: string;
    dimension: QualityDimension;
    dimensionDefinition: MultilingualContent[];
}

export enum QualityAssessmentTarget {
    PERSON = "PERSON",
    ORGANISATION_UNIT = "ORGANISATION_UNIT",
    EVENT = "EVENT",
    DOCUMENT = "DOCUMENT",
    JOURNAL = "JOURNAL",
    BOOK_SERIES = "BOOK_SERIES",
    PUBLISHER = "PUBLISHER"
}
