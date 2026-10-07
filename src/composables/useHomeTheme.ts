import { computed } from "vue";
import { getConfig } from "@/plugin-system/registry";
import { usePublicConfigurationStore } from "@/stores/publicConfigurationStore";

export type HomeTheme = "dark" | "light";

export function normalizeHomeTheme(value: unknown): HomeTheme | null {
    if (typeof value !== "string") {
        return null;
    }

    const normalized = value.toLowerCase();
    return normalized === "light" || normalized === "dark" ? normalized : null;
}

function pluginHomeTheme(): HomeTheme {
    return getConfig().homeTheme === "light" ? "light" : "dark";
}

export function useHomeTheme() {
    const publicConfigurationStore = usePublicConfigurationStore();

    const chromeTheme = computed<HomeTheme>(() =>
        normalizeHomeTheme(publicConfigurationStore.config?.branding.chromeTheme) ?? pluginHomeTheme()
    );
    const heroTheme = computed<HomeTheme>(() =>
        normalizeHomeTheme(publicConfigurationStore.config?.branding.heroTheme) ?? pluginHomeTheme()
    );

    return { chromeTheme, heroTheme };
}
