export interface Page<Type> {
    content: Type[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface MultilingualContent {
    languageTagId: number;
    languageTag: string;
    content: string;
    priority: number;
}

export interface LanguageResponse {
    id: number;
    languageCode: string;
    name: MultilingualContent[];
}

export interface LanguageTagResponse {
    id: number;
    languageCode: string;
    display: string;
}

export interface LanguageTag {
    languageCode: string;
    display: string;
}

export interface ExternalValidation {
    passed: boolean;
    message: string;
}

export interface Country {
    id?: number;
    code: string;
    name: MultilingualContent[];
}

export enum ApproveStatus {
    REQUESTED,
    APPROVED,
    DECLINED,
}

export interface ErrorResponse {
    errors: Record<string, any>; // Dynamic keys and values
    message: string;
    path: string;
    statusCode: number;
    statusReason: string;
    timestamp: string;
}

export enum NotificationAction {
    APPROVE = "APPROVE",
    REMOVE_FROM_PUBLICATION = "REMOVE_FROM_PUBLICATION",
    PERFORM_DEDUPLICATION = "PERFORM_DEDUPLICATION",
    BROWSE_CLAIMABLE_DOCUMENTS = "BROWSE_CLAIMABLE_DOCUMENTS",
    PERFORM_EVENT_CLASSIFICATION = "PERFORM_EVENT_CLASSIFICATION",
    PERFORM_DOCUMENT_ASSESSMENT = "PERFORM_DOCUMENT_ASSESSMENT"
}

export interface Notification {
    id: number;
    notificationText: string;
    possibleActions: NotificationAction[];
}

export interface ResearchAreaResponse {
    id? : number;
    name: MultilingualContent[];
    description: MultilingualContent[];
    superResearchAreaId?: number;
    superResearchAreaName?: MultilingualContent[];
}

export interface ResearchAreaRequest {
    name: MultilingualContent[];
    description: MultilingualContent[];
    superResearchAreaId?: number;
}

export enum AccessLevel {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    ADMIN_ONLY = "ADMIN_ONLY"
}

export enum ApplicableEntityType {
    MONOGRAPH = "MONOGRAPH",
    EVENT = "EVENT",
    DOCUMENT = "DOCUMENT",
    PERSON = "PERSON",
    ORGANISATION_UNIT = "ORGANISATION_UNIT",
    PUBLICATION_SERIES = "PUBLICATION_SERIES",
    ALL = "ALL"
}

export interface ScheduledTaskResponse {
    taskId: string;
    executionTime: string;
}

export enum ScheduledTaskType {
    REINDEXING = "REINDEXING",
    INDICATOR_LOAD = "INDICATOR_LOAD",
    IF5_COMPUTATION = "IF5_COMPUTATION",
    CLASSIFICATION_COMPUTATION = "CLASSIFICATION_COMPUTATION",
    CLASSIFICATION_LOAD = "CLASSIFICATION_LOAD",
    JOURNAL_PUBLICATIONS_ASSESSMENT = "JOURNAL_PUBLICATIONS_ASSESSMENT",
    PROCEEDINGS_PUBLICATIONS_ASSESSMENT = "PROCEEDINGS_PUBLICATIONS_ASSESSMENT",
    REPORT_GENERATION = "REPORT_GENERATION"
}

export interface BrandingInformation {
    title: MultilingualContent[];
    description: MultilingualContent[];
}

export enum ApiKeyType {
    M_SERVICE = "M_SERVICE"
}

export interface ApiKeyRequest {
    name: MultilingualContent[],
    type: ApiKeyType,
    clientEmail: string,
    validUntil: string,
    clientPreferredLanguageId: number,
    dailyRequests: number
}

export interface ApiKeyResponse {
    id: number,
    name: MultilingualContent[],
    type: ApiKeyType,
    validUntil: string,
    clientEmail: string,
    dailyRequests: number
}

export interface SearchFieldsResponse {
    a: string;
    b: MultilingualContent[];
    c: string;
}

export enum ExportFileFormat {
    CSV = "CSV",
    XLS = "XLS"
}

export enum ExportEntity {
    PERSON = "PERSON",
    ORGANISATION_UNIT = "ORGANISATION_UNIT",
    DOCUMENT = "DOCUMENT",
    THESIS = "THESIS"
}

export enum ExportableEndpointType {
    PERSON_SEARCH = "PERSON_SEARCH",
    DOCUMENT_SEARCH = "DOCUMENT_SEARCH",
    ORGANISATION_UNIT_SEARCH = "ORGANISATION_UNIT_SEARCH",
    PERSON_OUTPUTS = "PERSON_OUTPUTS",
    ORGANISATION_UNIT_OUTPUTS = "ORGANISATION_UNIT_OUTPUTS",
    ORGANISATION_UNIT_EMPLOYEES = "ORGANISATION_UNIT_EMPLOYEES",
    THESIS_SIMPLE_SEARCH = "THESIS_SIMPLE_SEARCH",
    THESIS_ADVANCED_SEARCH = "THESIS_ADVANCED_SEARCH"
}

export interface CSVExportRequest {
    columns: string[];
    exportEntityIds: number[];
    exportMaxPossibleAmount: boolean;
    bulkExportOffset: number;
    exportLanguage: string;
    exportFileType: ExportFileFormat;
    endpointType?: ExportableEndpointType;
    endpointTokenParameters?: string[];
}


export interface DocumentCSVExportRequest extends CSVExportRequest {
    apa: boolean;
    mla: boolean;
    harvard: boolean;
    chicago: boolean;
    vancouver: boolean;
}
