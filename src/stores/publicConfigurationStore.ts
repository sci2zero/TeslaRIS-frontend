import { defineStore } from "pinia";
import PublicConfigurationService from "@/services/PublicConfigurationService";
import {
    DEFAULT_BACKGROUND_URL,
    DEFAULT_LOGO_URL,
    getBuildDefaultPublicConfiguration,
    isValidPublicConfiguration,
    resolvePublicAssetUrl
} from "@/config/defaultPublicConfig";
import {
    PUBLIC_CONFIGURATION_STORAGE_KEY,
    type PublicConfiguration
} from "@/models/PublicConfiguration";

function readCachedConfiguration(): PublicConfiguration | null {
    try {
        const raw = localStorage.getItem(PUBLIC_CONFIGURATION_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return isValidPublicConfiguration(parsed) ? parsed : null;
    } catch {
        localStorage.removeItem(PUBLIC_CONFIGURATION_STORAGE_KEY);
        return null;
    }
}

function persistConfiguration(config: PublicConfiguration) {
    localStorage.setItem(PUBLIC_CONFIGURATION_STORAGE_KEY, JSON.stringify(config));
}

function preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = url;
    });
}

export const usePublicConfigurationStore = defineStore("publicConfiguration", {
    state: (): {
        config: PublicConfiguration | null;
        loading: boolean;
        refreshing: boolean;
        backendUnavailable: boolean;
    } => ({
        config: null,
        loading: false,
        refreshing: false,
        backendUnavailable: false
    }),
    getters: {
        title: (state) => state.config?.branding.title ?? [],
        description: (state) => state.config?.branding.description ?? [],
        hasCustomLogo: (state) => !!state.config?.branding.logoUrl,
        logoDisplayUrl: (state) =>
            resolvePublicAssetUrl(state.config?.branding.logoUrl) ?? DEFAULT_LOGO_URL,
        backgroundDisplayUrl: (state) =>
            resolvePublicAssetUrl(state.config?.branding.backgroundUrl) ?? DEFAULT_BACKGROUND_URL,
        hasCustomBackground: (state) => !!state.config?.branding.backgroundUrl
    },
    actions: {
        hydrateFromCacheOrDefault() {
            const cached = readCachedConfiguration();
            if (cached) {
                this.config = cached;
                this.loading = false;
                return;
            }

            const buildDefault = getBuildDefaultPublicConfiguration();
            if (buildDefault) {
                this.config = buildDefault;
                this.loading = false;
                return;
            }

            this.config = null;
            this.loading = true;
        },
        async refreshFromBackend() {
            const blockUi = this.backendUnavailable || !this.config;
            this.refreshing = true;
            if (blockUi) {
                this.loading = true;
            }
            this.backendUnavailable = false;

            try {
                const response = await PublicConfigurationService.fetchPublicConfiguration();
                const incoming = response.data;
                if (!isValidPublicConfiguration(incoming)) {
                    this.backendUnavailable = true;
                    return;
                }

                if (this.config?.updatedAt === incoming.updatedAt) {
                    persistConfiguration(incoming);
                    this.loading = false;
                    return;
                }

                const nextLogoUrl = resolvePublicAssetUrl(incoming.branding.logoUrl);
                const previousLogoUrl = resolvePublicAssetUrl(this.config?.branding.logoUrl);
                if (nextLogoUrl && nextLogoUrl !== previousLogoUrl) {
                    await preloadImage(nextLogoUrl);
                }

                const nextBackgroundUrl = resolvePublicAssetUrl(incoming.branding.backgroundUrl);
                const previousBackgroundUrl = resolvePublicAssetUrl(this.config?.branding.backgroundUrl);
                if (nextBackgroundUrl && nextBackgroundUrl !== previousBackgroundUrl) {
                    await preloadImage(nextBackgroundUrl);
                }

                this.config = incoming;
                persistConfiguration(incoming);
                this.backendUnavailable = false;
            } catch (error) {
                console.error("Failed to refresh public configuration", error);
                this.backendUnavailable = true;
            } finally {
                this.loading = false;
                this.refreshing = false;
            }
        }
    }
});
