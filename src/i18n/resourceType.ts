import { ResourceType } from "@/models/DocumentFileModel";
import i18n from ".";
import { getNameFromOrdinal } from "@/utils/EnumUtil";

export const resourceTypeSr = [
    { title: "Preprint", value: ResourceType.PREPRINT },
    { title: "Oficijalna Publikacija", value: ResourceType.OFFICIAL_PUBLICATION },
    { title: "Dodatak", value: ResourceType.SUPPLEMENT },
];

export const resourceTypeEn = [
    { title: "Preprint", value: ResourceType.PREPRINT },
    { title: "Official Publication", value: ResourceType.OFFICIAL_PUBLICATION },
    { title: "Supplement", value: ResourceType.SUPPLEMENT },
];

export const getResourceTypeTitleFromValueAutoLocale = (value: ResourceType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = resourceTypeEn;
    if (locale == "sr") {
        resourceTypeArray = resourceTypeSr;
    }

    if (typeof value === "number") {
        return (resourceTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (resourceTypeArray.find(item => getNameFromOrdinal(ResourceType, item.value) === value) || {}).title;
    }
};