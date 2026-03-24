import { MonographPublicationType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const monographPublicationTypeEn = [
    { title: "Chapter", value: MonographPublicationType.CHAPTER },
    { title: "Research Article", value: MonographPublicationType.RESEARCH_ARTICLE },
    { title: "Preface", value: MonographPublicationType.PREFACE },
    { title: "Polemics", value: MonographPublicationType.POLEMICS },
    { title: "Scientific critic", value: MonographPublicationType.SCIENTIFIC_CRITIC },
    { title: "Lexicographic Unit", value: MonographPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Postface", value: MonographPublicationType.POSTFACE },
    { title: "Book review", value: MonographPublicationType.BOOK_REVIEW },
    { title: "Entry", value: MonographPublicationType.ENTRY }
];

export const monographPublicationTypeSr = [
    { title: "Istraživački članak", value: MonographPublicationType.RESEARCH_ARTICLE },
    { title: "Predgovor", value: MonographPublicationType.PREFACE },
    { title: "Poglavlje", value: MonographPublicationType.CHAPTER },
    { title: "Leksikografska jedinica", value: MonographPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Polemika", value: MonographPublicationType.POLEMICS },
    { title: "Naučna kritika", value: MonographPublicationType.SCIENTIFIC_CRITIC },
    { title: "Pogovor", value: MonographPublicationType.POSTFACE },
    { title: "Recenzija knjige", value: MonographPublicationType.BOOK_REVIEW },
    { title: "Odrednica", value: MonographPublicationType.ENTRY }
];

export const getTitleFromValue = (value: MonographPublicationType, monographPublicationTypeArray: {title: string, value: MonographPublicationType}[]) => {
    return (monographPublicationTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: MonographPublicationType | string) => {
    const locale = i18n.vueI18n.global.locale;

    let monographPublicationTypeArray = monographPublicationTypeEn;
    if (locale == "sr") {
        monographPublicationTypeArray = monographPublicationTypeSr;
    } else if (locale == "sr-cyr") {
        monographPublicationTypeArray = transliterateContentToCyrillic(monographPublicationTypeSr);
    }

    return (monographPublicationTypeArray.find(item => item.value === value) || {}).title;
};

export const getMonographPublicationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return monographPublicationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(monographPublicationTypeSr);
        case "en":
            return monographPublicationTypeEn;
    }
};
