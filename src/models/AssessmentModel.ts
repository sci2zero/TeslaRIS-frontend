import type { AccessLevel, ApplicableEntityType, MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";


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
    formalDescriptionOfRule: string;
}

export interface CommissionResponse {
    id: number;
    description: MultilingualContent[];
    sources?: string[];
    assessmentDateFrom: string;
    assessmentDateTo: string;
    formalDescriptionOfRule: string;
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
    ERIH_PLUS = "ERIH_PLUS",
    MKS_SLAVISTS = "MKS_SLAVISTS"
}

export enum EntityClassificationSource {
    MNO = "MNO"
}

export interface EntityAssessmentClassification {
    commissionId: number;
    assessmentClassificationId: number;
    classificationYear: number;
}

export interface EventAssessmentClassification extends EntityAssessmentClassification {
    eventId: number;
}

export interface PublicationSeriesAssessmentClassification extends EntityAssessmentClassification {
    publicationSeriesId: number;
}

export interface AssessmentClassification {
    id?: number;
    formalDescriptionOfRule: string;
    code: string;
    title: MultilingualContent[];
    applicableTypes: ApplicableEntityType[];
}
<<<<<<< Updated upstream
=======

export enum ResultCalculationMethod {
    BEST_VALUE = "BEST_VALUE",
    WORST_VALUE = "WORST_VALUE"
}

export interface CommissionRelation {
    sourceCommissionId: number;
    targetCommissionIds: number[];
    priority: number;
    resultCalculationMethod: ResultCalculationMethod;
}

export interface ReorderCommissionRelation {
    oldRelationPriority: number;
    newRelationPriority: number;
}

export interface SimpleCommissionResponse {
    id: number;
    description: MultilingualContent[];
}

export interface CommissionRelationResponse {
    id: number;
    sourceCommissionId: number;
    targetCommissions: SimpleCommissionResponse[];
    priority: number;
    resultCalculationMethod: ResultCalculationMethod;
}

export interface PublicationAssessmentRequest {
    commissionId: number | null;
    authorIds: number[];
    organisationUnitIds: number[];
    publishedInIds: number[];
}

export interface AssessmentResearchArea {
    name: MultilingualContent[],
    code: string
}

export interface ResearcherAssessmentResponse {
    commissionDescription: MultilingualContent[];
    commissionId: number;
    publicationsPerCategory: Record<string, {a: string, b :number, c :number}[]>;
}
>>>>>>> Stashed changes
