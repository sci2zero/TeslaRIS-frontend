import {
    PUBLIC_CONFIGURATION_SCHEMA_VERSION,
    type PublicConfiguration
} from "@/models/PublicConfiguration";

export const DEFAULT_LOGO_URL = "/logov1.svg";
const NOVI_SAD_BACKGROUND_URL = "/NTP_Novi_Sad_zgrada_6.jpeg";
const LIBRARY_HERO_BACKGROUND_URL = "/images/library-hero.png";

export const DEFAULT_BACKGROUND_URL = import.meta.env.VITE_PLUGIN_PROFILE === "portugal"
    ? LIBRARY_HERO_BACKGROUND_URL
    : NOVI_SAD_BACKGROUND_URL;


export const defaultPublicConfiguration: PublicConfiguration = {
    schemaVersion: PUBLIC_CONFIGURATION_SCHEMA_VERSION,
    updatedAt: "default",
    branding: {
        title: [
            { languageTagId: 0, languageTag: "EN", content: "TeslaRIS", priority: 1 },
            { languageTagId: 0, languageTag: "SR", content: "TeslaRIS", priority: 2 }
        ],
        description: [],
        logoUrl: null,
        backgroundUrl: null
    }
};

export function getBuildDefaultPublicConfiguration(): PublicConfiguration | null {
    const fromEnv = import.meta.env.VITE_DEFAULT_PUBLIC_CONFIG;
    if (fromEnv && String(fromEnv).trim()) {
        try {
            const parsed = JSON.parse(String(fromEnv));
            if (isValidPublicConfiguration(parsed)) {
                return parsed;
            }
        } catch {
            // Fall through to the compiled default.
        }
    }

    return null;
    // return defaultPublicConfiguration;
}

export function isValidPublicConfiguration(value: unknown): value is PublicConfiguration {
    if (!value || typeof value !== "object") {
        return false;
    }

    const config = value as Partial<PublicConfiguration>;
    return config.schemaVersion === PUBLIC_CONFIGURATION_SCHEMA_VERSION
        && typeof config.updatedAt === "string"
        && !!config.branding
        && Array.isArray(config.branding.title)
        && Array.isArray(config.branding.description);
}

export function resolvePublicAssetUrl(path: string | null | undefined): string | null {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path) || path.startsWith("/")) {
        return path;
    }

    const baseUrl = import.meta.env.VITE_BASE_URL as string;
    return `${baseUrl}${path}`;
}
