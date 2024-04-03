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
