import type { MultilingualContent } from "./Common";

export enum ResourceType {
    PREPRINT,
    OFFICIAL_PUBLICATION,
    SUPPLEMENT,
    STATEMENT
}

export enum License {
    ALL_RIGHTS_RESERVED,
    CREATIVE_COMMONS,
    EMBARGOED_ACCESS,
    OPEN_ACCESS,
    PUBLIC_DOMAIN,
    SUBSCRIPTION_BASED_ACCESS
}

export enum CCLicense {
    BY = "BY",
    BY_SA = "BY_SA",
    BY_NC = "BY_NC",
    BY_NC_SA = "BY_NC_SA",
    BY_ND = "BY_ND",
    BY_NC_ND = "BY_NC_ND",
    CC0 = "CC0"
}

export interface DocumentFileResponse {
    id: number;
    fileName: string;
    serverFilename: string;
    description: MultilingualContent[];
    resourceType: ResourceType;
    license: License;
    ccLicense: CCLicense;
    sizeInMb: number;
}

export interface DocumentFile {
    id?: number;
    file: File;
    description: MultilingualContent[];
    resourceType: ResourceType;
    license: License;
    ccLicense: CCLicense;
}

export enum ThesisAttachmentType {
    FILE = "FILE",
    SUPPLEMENT = "SUPPLEMENT",
    COMMISSION_REPORT = "COMMISSION_REPORT"
}

export enum DocumentFileSection {
    PROOFS = "PROOFS",
    FILE_ITEMS = "FILE_ITEMS"
}
