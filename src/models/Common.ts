import { RecurrenceType } from "./LoadModel";
import type { PersonDocumentContribution, PublicationType } from "./PublicationModel";

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
    PERFORM_DOCUMENT_ASSESSMENT = "PERFORM_DOCUMENT_ASSESSMENT",
    GO_TO_PROMOTIONS_PAGE = "GO_TO_PROMOTIONS_PAGE",
    GO_TO_HARVESTER_PAGE = "GO_TO_HARVESTER_PAGE",
    NAVIGATE_TO_URL = "NAVIGATE_TO_URL",
    GO_TO_VALIDATION_PAGE = "GO_TO_VALIDATION_PAGE",
    GO_TO_UNBINDED_PUBLICATIONS_PAGE = "GO_TO_UNBINDED_PUBLICATIONS_PAGE",
    REMOVE_EMPLOYEES_FROM_PUBLICATION = "REMOVE_EMPLOYEES_FROM_PUBLICATION",
    RETURN_TO_PUBLICATION = "RETURN_TO_PUBLICATION"
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
    displayDescription?: string;
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
    recurrenceType: RecurrenceType;
}

export enum ScheduledTaskType {
    REINDEXING = "REINDEXING",
    INDICATOR_LOAD = "INDICATOR_LOAD",
    IF5_COMPUTATION = "IF5_COMPUTATION",
    CLASSIFICATION_COMPUTATION = "CLASSIFICATION_COMPUTATION",
    CLASSIFICATION_LOAD = "CLASSIFICATION_LOAD",
    JOURNAL_PUBLICATIONS_ASSESSMENT = "JOURNAL_PUBLICATIONS_ASSESSMENT",
    PROCEEDINGS_PUBLICATIONS_ASSESSMENT = "PROCEEDINGS_PUBLICATIONS_ASSESSMENT",
    REPORT_GENERATION = "REPORT_GENERATION",
    UNMANAGED_DOCUMENTS_DELETION = "UNMANAGED_DOCUMENTS_DELETION"
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
    XLSX = "XLSX",
    BIB = "BIB",
    RIS = "RIS",
    ENW = "ENW"
}

export const getExtensionForExportFileFormat = (format: ExportFileFormat): string => {
    switch (format) {
        case ExportFileFormat.CSV:
            return ".csv";
        case ExportFileFormat.XLSX:
            return ".xlsx";
        case ExportFileFormat.BIB:
            return ".bib";
        case ExportFileFormat.RIS:
            return ".ris";
        case ExportFileFormat.ENW:
            return ".enw";
    }
}

export enum ExportEntity {
    PERSON = "PERSON",
    ORGANISATION_UNIT = "ORGANISATION_UNIT",
    DOCUMENT = "DOCUMENT",
    THESIS = "THESIS"
}

export enum ExportableEndpointType {
    PERSON_SEARCH = "PERSON_SEARCH",
    PERSON_SEARCH_ADVANCED = "PERSON_SEARCH_ADVANCED",
    DOCUMENT_SEARCH = "DOCUMENT_SEARCH",
    DOCUMENT_ADVANCED_SEARCH = "DOCUMENT_ADVANCED_SEARCH",
    ORGANISATION_UNIT_SEARCH = "ORGANISATION_UNIT_SEARCH",
    ORGANISATION_UNIT_SEARCH_ADVANCED = "ORGANISATION_UNIT_SEARCH_ADVANCED",
    PERSON_OUTPUTS = "PERSON_OUTPUTS",
    ORGANISATION_UNIT_OUTPUTS = "ORGANISATION_UNIT_OUTPUTS",
    ORGANISATION_UNIT_EMPLOYEES = "ORGANISATION_UNIT_EMPLOYEES",
    THESIS_SIMPLE_SEARCH = "THESIS_SIMPLE_SEARCH",
    THESIS_ADVANCED_SEARCH = "THESIS_ADVANCED_SEARCH",
    AUTHOR_REPRINT_DOCUMENTS_SEARCH = "AUTHOR_REPRINT_DOCUMENTS_SEARCH"
}

export interface TableExportRequest {
    columns: string[];
    exportEntityIds: number[];
    exportMaxPossibleAmount: boolean;
    bulkExportOffset: number;
    exportLanguage: string;
    exportFileType: ExportFileFormat;
    endpointType?: ExportableEndpointType;
    endpointTokenParameters?: string[];
}


export interface DocumentTableExportRequest extends TableExportRequest {
    apa: boolean;
    mla: boolean;
    harvard: boolean;
    chicago: boolean;
    vancouver: boolean;
    allowedTypes: PublicationType[];
    institutionId: number;
    commissionId: number;
    onlyUnmanaged: boolean;
}

export interface EntityNavigationDetails {
    entityType: string;
    databaseId: number;
}

export interface DocumentFileNavigationDetails {
    serverFilename: string;
    filename: string;
}

export interface PrepopulatedMetadata {
    title: MultilingualContent[];
    contributions: PersonDocumentContribution[];
    publishedInName: string;
    publishEntityId: number;
    documentPublicationType: PublicationType;
    volume: string;
    issue: string;
    year: number;
    startPage: string;
    endPage: string;
    url: string;
    doi: string;
}

export interface ContactFormData {
    name: string,
    senderEmail: string,
    subject: string,
    message: string,
    captchaToken: string
}

export interface NotificationActionResult {
    value: string
}

export interface DownloadState {
    progress: number
    fileName: string
    isDownloading: boolean
}
