import type { MultilingualContent } from "./Common";

export enum ResourceType {
    PREPRINT,
    OFFICIAL_PUBLICATION,
    SUPPLEMENT,
}

export enum License {
    BSD,
    CREATIVE_COMMONS,
    APACHE,
    OPEN_ACCESS
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
