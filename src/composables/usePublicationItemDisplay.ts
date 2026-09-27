import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import { getPublicationTypeTitleFromValueAutoLocale } from "@/i18n/publicationType";
import { getTitleFromValueAutoLocale as getJournalPublicationTypeTitle } from "@/i18n/journalPublicationType";
import { getTitleFromValueAutoLocale as getProceedingsPublicationTypeTitle } from "@/i18n/proceedingsPublicationType";
import { getTitleFromValueAutoLocale as getMonographPublicationTypeTitle } from "@/i18n/monographPublicationType";

export function getPublicationTypeIcon(type: string): string {
    switch (type) {
        case "JOURNAL_PUBLICATION":
            return "mdi-book-open-page-variant";
        case "PROCEEDINGS":
            return "mdi-presentation";
        case "INTELLECTUAL_PROPERTY":
            return "mdi-shield-check";
        case "INTANGIBLE_PRODUCT":
            return "mdi-code-tags";
        case "MONOGRAPH":
            return "mdi-book";
        case "MONOGRAPH_PUBLICATION":
            return "mdi-book-open";
        case "THESIS":
            return "mdi-school";
        case "MATERIAL_PRODUCT":
            return "mdi-hammer-wrench";
        case "GENETIC_MATERIAL":
            return "mdi-sprout";
        case "PERFORMANCE_RELATED_OUTPUT":
            return "mdi-drama-masks";
        default:
            return "mdi-file-document";
    }
}

export function getConcretePublicationType(publicationType: string): string | undefined {
    const possibleValues = [
        getJournalPublicationTypeTitle(publicationType),
        getProceedingsPublicationTypeTitle(publicationType),
        getMonographPublicationTypeTitle(publicationType)
    ];

    return possibleValues.find((value) => value);
}

export function getPublicationTypeLabel(item: DocumentPublicationIndex, showConcrete = false): string {
    if (showConcrete) {
        return getConcretePublicationType(item.publicationType) || getPublicationTypeTitleFromValueAutoLocale(item.type);
    }

    return getPublicationTypeTitleFromValueAutoLocale(item.type);
}

export function splitAuthorNames(item: DocumentPublicationIndex): string[] {
    if (!item.authorNames?.trim()) {
        return [];
    }

    return item.authorNames.split(";").map((author) => author.trim()).filter(Boolean);
}

export function usePublicationItemDisplay() {
    const i18n = useI18n();
    const isSerbian = computed(() => i18n.locale.value.startsWith("sr"));

    const getItemTitle = (item: DocumentPublicationIndex): string => {
        return isSerbian.value ? item.titleSr : item.titleOther;
    };

    const getItemDescription = (item: DocumentPublicationIndex): string => {
        return isSerbian.value ? item.descriptionSr : item.descriptionOther;
    };

    return {
        isSerbian,
        getItemTitle,
        getItemDescription,
        splitAuthorNames,
        getPublicationTypeIcon,
        getPublicationTypeLabel,
        getConcretePublicationType
    };
}
