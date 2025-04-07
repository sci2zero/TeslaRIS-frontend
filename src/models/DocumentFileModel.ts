import type { MultilingualContent } from "./Common";

export enum ResourceType {
    PREPRINT,
    OFFICIAL_PUBLICATION,
    SUPPLEMENT,
}

export enum License {
    ALL_RIGHTS_RESERVED,
    CREATIVE_COMMONS,
    EMBARGOED_ACCESS,
    OPEN_ACCESS,
    PUBLIC_DOMAIN,
    SUBSCRIPTION_BASED_ACCESS
}

export interface DocumentFileResponse {
    id: number;
    fileName: string;
    serverFilename: string;
    description: MultilingualContent[];
    resourceType: ResourceType;
    license: License;
    sizeInMb: number;
}

export interface DocumentFile {
    id?: number;
    file: File;
    description: MultilingualContent[];
    resourceType: ResourceType;
    license: License;
}

export enum ThesisAttachmentType {
    FILE = "FILE",
    SUPPLEMENT = "SUPPLEMENT",
    COMMISSION_REPORT = "COMMISSION_REPORT"
}
