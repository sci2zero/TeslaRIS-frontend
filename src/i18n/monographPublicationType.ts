import { MonographPublicationType } from "@/models/PublicationModel";
import i18n from ".";


export const monographPublicationTypeEn = [
    { title: "Chapter", value: MonographPublicationType.CHAPTER },
    { title: "Research Article", value: MonographPublicationType.RESEARCH_ARTICLE },
    { title: "Preface", value: MonographPublicationType.PREFACE },
    { title: "Polemics", value: MonographPublicationType.POLEMICS },
    { title: "Scientific critic", value: MonographPublicationType.SCIENTIFIC_CRITIC },
    { title: "Lexicographic Unit", value: MonographPublicationType.LEXICOGRAPHIC_UNIT },
];

export const monographPublicationTypeSr = [
    { title: "Istraživački članak", value: MonographPublicationType.RESEARCH_ARTICLE },
    { title: "Predgovor", value: MonographPublicationType.PREFACE },
    { title: "Poglavlje", value: MonographPublicationType.CHAPTER },
    { title: "Leksikografska jedinica", value: MonographPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Polemika", value: MonographPublicationType.POLEMICS },
    { title: "Naučna kritika", value: MonographPublicationType.SCIENTIFIC_CRITIC },
];

export const getTitleFromValue = (value: MonographPublicationType, resourceTypeArray: {title: string, value: MonographPublicationType}[]) => {
    return (resourceTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: MonographPublicationType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = monographPublicationTypeEn;
    if (locale == "sr") {
        resourceTypeArray = monographPublicationTypeSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getMonographPublicationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return monographPublicationTypeSr;
        case "en":
            return monographPublicationTypeEn;
    }
};
