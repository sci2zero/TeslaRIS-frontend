import { computed, ref } from "vue";
import { getConfig } from "@/plugin-system/registry";

export type HomeTheme = "dark" | "light";

const STORAGE_KEY = "teslaris-home-theme";

function readStoredTheme(): HomeTheme | null {
    if (typeof localStorage === "undefined") {
        return null;
    }

    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
}

const storedHomeTheme = ref<HomeTheme | null>(readStoredTheme());

export function setHomeTheme(theme: HomeTheme) {
    storedHomeTheme.value = theme;
    localStorage.setItem(STORAGE_KEY, theme);
}

function pluginHomeTheme(): HomeTheme {
    return getConfig().homeTheme === "light" ? "light" : "dark";
}

export function useHomeTheme() {
    const homeTheme = computed<HomeTheme>(() => storedHomeTheme.value ?? pluginHomeTheme());

    return { homeTheme };
}
