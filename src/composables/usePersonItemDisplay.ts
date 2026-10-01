import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PersonIndex } from "@/models/PersonModel";
import { localiseDate } from "@/utils/DateUtil";

export interface PersonEmploymentEntry {
    name: string;
    institutionId: number;
}

export function splitPersonNames(item: PersonIndex): string[] {
    if (!item.name?.trim()) {
        return [];
    }

    return item.name.split("; ").map((name) => name.trim()).filter(Boolean);
}

export function extractYear(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "";
    }

    return String(date.getFullYear());
}

export function usePersonItemDisplay() {
    const i18n = useI18n();
    const isSerbian = computed(() => i18n.locale.value.startsWith("sr"));

    const getEmploymentEntries = (item: PersonIndex): PersonEmploymentEntry[] => {
        const raw = isSerbian.value ? item.employmentsSr : item.employmentsOther;
        if (!raw?.trim() || !item.employmentInstitutionsId?.length) {
            return [];
        }

        return raw.split("; ").map((name, index) => ({
            name: name.trim(),
            institutionId: item.employmentInstitutionsId[index]
        })).filter((entry) => entry.name);
    };

    const hasEmployment = (item: PersonIndex): boolean => getEmploymentEntries(item).length > 0;

    const getBirthdateLabel = (item: PersonIndex): string => {
        if (!item.birthdate) {
            return "";
        }

        return item.displayBirthdate ? localiseDate(item.birthdate) : extractYear(item.birthdate);
    };

    const hasIdentifiers = (item: PersonIndex): boolean => {
        return Boolean(item.orcid || item.scopusAuthorId || item.openAlexId || item.webOfScienceResearcherId);
    };

    return {
        isSerbian,
        getEmploymentEntries,
        hasEmployment,
        getBirthdateLabel,
        hasIdentifiers,
        splitPersonNames,
        extractYear
    };
}
