import type { AccessLevel, ApplicableEntityType, MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";
import { EntityType } from "./MergeModel";


export interface IndicatorResponse {
    id: number;
    code: string;
    title: MultilingualContent[];
    description: MultilingualContent[];
    applicableEntityTypes: ApplicableEntityType[];
    contentType: IndicatorContentType;
}

export interface IndicatorRequest {
    code: string;
    title: MultilingualContent[];
    description: MultilingualContent[];
    indicatorAccessLevel: AccessLevel;
    applicableTypes: ApplicableEntityType[];
    contentType: IndicatorContentType;
}

export interface EntityIndicatorResponse {
    id: number;
    numericValue?: number;
    booleanValue?: boolean;
    textualValue?: string;
    fromDate?: string;
    toDate?: string;
    indicatorResponse: IndicatorResponse;
    source: EntityIndicatorSource
}

export interface EntityClassificationResponse {
    id: number;
    manual: boolean;
    classificationTitle: MultilingualContent[];
    classificationId: number;
    commissionDescription: MultilingualContent[];
    commissionId: number;
    categoryIdentifier: string;
    year: number;
    timestamp: string;
    applicableEntityTypes: ApplicableEntityType[];
}

export interface PublicationSeriesIndicatorResponse extends EntityIndicatorResponse {
    categoryIdentifier: string;
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

export interface EntityIndicator {
    numericValue?: number;
    booleanValue?: boolean;
    textualValue?: string;
    fromDate?: string;
    toDate?: string;
    indicatorId: number;
}

export interface DocumentIndicator extends EntityIndicator {
    documentId: number;
}

export interface EventIndicator extends EntityIndicator {
    eventId: number;
}

export enum IndicatorContentType {
    TEXT = "TEXT",
    BOOL = "BOOL",
    NUMBER = "NUMBER",
    ANYTHING = "ANYTHING"
}

export enum EntityIndicatorSource {
    MANUAL = "MANUAL",
    WEB_OF_SCIENCE = "WEB_OF_SCIENCE",
    SCIMAGO = "SCIMAGO",
    ERIH_PLUS = "ERIH_PLUS"
}

export interface EntityAssessmentClassification {
    commissionId: number;
    assessmentClassificationId: number;
    classificationYear: number;
}

export interface EventAssessmentClassification extends EntityAssessmentClassification {
    eventId: number;
}

export interface AssessmentClassification {
    id: number;
    formalDescriptionOfRule: string;
    code: string;
    title: MultilingualContent[];
    applicableEntityType: EntityType;
}
