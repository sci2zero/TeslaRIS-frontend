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

export interface ExternalValidation {
    passed: boolean;
    message: string;
}

export interface Country {
    id: number;
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
    PERFORM_DEDUPLICATION = "PERFORM_DEDUPLICATION"
}

export interface Notification {
    id: number;
    notificationText: string;
    possibleActions: NotificationAction[];
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
    ALL = "ALL"
}
