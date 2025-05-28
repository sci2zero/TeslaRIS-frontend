import { MonographType } from "@/models/PublicationModel";
import i18n from ".";

const monographTypeEn = [
    { title: "Research Monograph", value: MonographType.RESEARCH_MONOGRAPH },
    { title: "Study", value: MonographType.STUDY },
    { title: "Book", value: MonographType.BOOK },
    { title: "Translation", value: MonographType.TRANSLATION },
    { title: "Bibliography", value: MonographType.BIBLIOGRAPHY },
];

const monographTypeSr = [
    { title: "Istraživačka monografija", value: MonographType.RESEARCH_MONOGRAPH },
    { title: "Studija", value: MonographType.STUDY },
    { title: "Knjiga", value: MonographType.BOOK },
    { title: "Prevod", value: MonographType.TRANSLATION },
    { title: "Bibliografija", value: MonographType.BIBLIOGRAPHY },
];

export const getTitleFromValue = (value: MonographType, monographTypeArray: {title: string, value: MonographType}[]) => {
    return (monographTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getMonographTypeTitleFromValueAutoLocale = (value: MonographType) => {
    const locale = i18n.vueI18n.global.locale;

    let monographTypeArray = monographTypeEn;
    if (locale == "sr") {
        monographTypeArray = monographTypeSr;
    }

    return (monographTypeArray.find(item => item.value === value) || {}).title;
};

export const getMonographTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return monographTypeSr;
        case "en":
            return monographTypeEn;
    }
}
