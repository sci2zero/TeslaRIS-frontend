import { ResourceType } from "@/models/DocumentFileModel";
import i18n from ".";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const resourceTypeSr = [
    { title: "Preprint", value: ResourceType.PREPRINT },
    { title: "Oficijalna Publikacija", value: ResourceType.OFFICIAL_PUBLICATION },
    { title: "Dodatak", value: ResourceType.SUPPLEMENT },
    { title: "Izjava", value: ResourceType.STATEMENT },
    { title: "Savetnik - Sukob interesa", value: ResourceType.ADVISOR_CONFLICT_OF_INTEREST },
];

export const resourceTypeEn = [
    { title: "Preprint", value: ResourceType.PREPRINT },
    { title: "Official Publication", value: ResourceType.OFFICIAL_PUBLICATION },
    { title: "Supplement", value: ResourceType.SUPPLEMENT },
    { title: "Statement", value: ResourceType.STATEMENT },
    { title: "Advisor - Conflict of Interest", value: ResourceType.ADVISOR_CONFLICT_OF_INTEREST },
];

export const getResourceTypeTitleFromValueAutoLocale = (value: ResourceType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = resourceTypeEn;
    if (locale == "sr") {
        resourceTypeArray = resourceTypeSr;
    } else if (locale == "sr-cyr") {
        resourceTypeArray = transliterateContentToCyrillic(resourceTypeSr);
    }

    if (typeof value === "number") {
        return (resourceTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (resourceTypeArray.find(item => getNameFromOrdinal(ResourceType, item.value) === value) || {}).title;
    }
};

export const getResourceTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return resourceTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(resourceTypeSr);
        case "en":
            return resourceTypeEn;
    }
};
