import type { AccessLevel, ApplicableEntityType, MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";


export interface IndicatorResponse {
    id: number;

    code: string;

    title: MultilingualContent[];

    description: MultilingualContent[];

    applicableEntityTypes: ApplicableEntityType[];
}

export interface IndicatorRequest {
    code: string;

    title: MultilingualContent[];

    description: MultilingualContent[];

    indicatorAccessLevel: AccessLevel;

    applicableTypes: ApplicableEntityType[];
}

export interface EntityIndicatorResponse {
    numericValue: number,

    booleanValue: boolean,

    textualValue: string,

    fromDate: string,

    toDate: string,

    indicatorResponse: IndicatorResponse
}

export enum StatisticsType {
    VIEW = "VIEW",
    DOWNLOAD = "DOWNLOAD"
}

export interface AssessmentMeasure {
    id?: number;

    formalDescriptionOfRule: string;
    
    code: string;
    
    value: number;
    
    title: MultilingualContent[];

    assessmentRulebookId: number;
}

export interface AssessmentRulebookResponse {
    id: number;
    name: MultilingualContent[];
    description: MultilingualContent[];
    issueDate: string;
    pdfFile?: DocumentFileResponse;
    publisherId: number;
    publisherName: MultilingualContent[];
}

export interface AssessmentRulebook {
    name: MultilingualContent[];
    description?: MultilingualContent[];
    issueDate: string;
    publisherId?: number;
}

export interface Commission {
    description: MultilingualContent[];
    sources?: string[];
    assessmentDateFrom: string;
    assessmentDateTo: string;
    documentIdsForAssessment: number[];
    personIdsForAssessment: number[];
    organisationUnitIdsForAssessment: number[];
    formalDescriptionOfRule: string;
    superCommissionId?: number;
}

export interface CommissionResponse {
    id: number;
    description: MultilingualContent[];
    sources?: string[];
    assessmentDateFrom: string;
    assessmentDateTo: string;
    documentIdsForAssessment: number[];
    personIdsForAssessment: number[];
    organisationUnitIdsForAssessment: number[];
    formalDescriptionOfRule: string;
    superCommissionId: number;
    superCommissionDescription: MultilingualContent[];
}
