import { computed } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

export const COMPACT_TABLE_BREAKPOINT = 1024;
export const PHONE_TABLE_BREAKPOINT = 768;

export function useResponsiveTable(
    compactBreakpoint = COMPACT_TABLE_BREAKPOINT,
    phoneBreakpoint = PHONE_TABLE_BREAKPOINT
) {
    const { width } = useDisplay();
    const isCompact = computed(() => width.value < compactBreakpoint);
    const isPhone = computed(() => width.value < phoneBreakpoint);

    return {
        width,
        isCompact,
        isPhone
    };
}

export function resolveHeaderValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "object" && value !== null && "value" in value) {
        return String((value as { value: unknown }).value ?? "");
    }

    return String(value);
}
