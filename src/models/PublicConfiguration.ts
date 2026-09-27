import type { MultilingualContent } from "@/models/Common";

export const PUBLIC_CONFIGURATION_SCHEMA_VERSION = 1;
export const PUBLIC_CONFIGURATION_STORAGE_KEY = "teslaris.publicConfig.v1";

export interface PublicBranding {
    title: MultilingualContent[];
    description: MultilingualContent[];
    logoUrl: string | null;
    backgroundUrl: string | null;
}

export interface PublicConfiguration {
    schemaVersion: number;
    updatedAt: string;
    branding: PublicBranding;
}
