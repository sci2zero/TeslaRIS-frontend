import { MonographType } from "@/models/PublicationModel";
import i18n from ".";

const monographTypeEn = [
    { title: "Bibliography", value: MonographType.BIBLIOGRAPHY },
    { title: "Book", value: MonographType.BOOK },
    { title: "Research Monograph", value: MonographType.RESEARCH_MONOGRAPH },
    { title: "Translation", value: MonographType.TRANSLATION }
];

const monographTypeSr = [
    { title: "Bibliografija", value: MonographType.BIBLIOGRAPHY },
    { title: "Knjiga", value: MonographType.BOOK },
    { title: "Istraživačka monografija", value: MonographType.RESEARCH_MONOGRAPH },
    { title: "Prevod", value: MonographType.TRANSLATION }
];

export const getTitleFromValue = (value: MonographType, resourceTypeArray: {title: string, value: MonographType}[]) => {
    return (resourceTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getMonographTypeTitleFromValueAutoLocale = (value: MonographType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = monographTypeEn;
    if (locale == "sr") {
        resourceTypeArray = monographTypeSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getMonographTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return monographTypeSr;
        case "en":
            return monographTypeEn;
    }
}
