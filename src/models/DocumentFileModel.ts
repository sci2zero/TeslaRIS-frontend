import type { MultilingualContent } from "./Common";

enum ResourceType {
    PREPRINT,
    OFFICIAL_PUBLICATION,
    SUPPLEMENT,
}

enum License {
    BSD,
    CREATIVE_COMMONS,
    APACHE,
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
