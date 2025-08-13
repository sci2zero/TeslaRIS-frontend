import { ProceedingsPublicationType } from "@/models/PublicationModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const proceedingsPublicationTypeEn = [
    { title: "Regular Full Article", value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE },
    { title: "Invited Full Article", value: ProceedingsPublicationType.INVITED_FULL_ARTICLE },
    { title: "Invited Abstract Article", value: ProceedingsPublicationType.INVITED_ABSTRACT_ARTICLE },
    { title: "Regular Abstract Article", value: ProceedingsPublicationType.REGULAR_ABSTRACT_ARTICLE },
    { title: "Preface", value: ProceedingsPublicationType.PREFACE },
    { title: "Lexicographic Unit", value: ProceedingsPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Polemics", value: ProceedingsPublicationType.POLEMICS },
    { title: "Scientific Critic", value: ProceedingsPublicationType.SCIENTIFIC_CRITIC },
];

export const proceedingsPublicationTypeSr = [
    { title: "Saopštenje sa skupa štampano u celini", value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE },
    { title: "Predavanje po pozivu štampano u celini", value: ProceedingsPublicationType.INVITED_FULL_ARTICLE },
    { title: "Predavanje po pozivu štampano u izvodu", value: ProceedingsPublicationType.INVITED_ABSTRACT_ARTICLE },
    { title: "Saopštenje sa skupa štampano u izvodu", value: ProceedingsPublicationType.REGULAR_ABSTRACT_ARTICLE },
    { title: "Predgovor", value: ProceedingsPublicationType.PREFACE },
    { title: "Leksikografska jedinica", value: ProceedingsPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Polemika", value: ProceedingsPublicationType.POLEMICS },
    { title: "Naučna kritika", value: ProceedingsPublicationType.SCIENTIFIC_CRITIC },
];

export const getTitleFromValue = (value: ProceedingsPublicationType, proceedingsPublicationTypeArray: {title: string, value: ProceedingsPublicationType}[]) => {
    return (proceedingsPublicationTypeArray.find(item => getNameFromOrdinal(ProceedingsPublicationType, item.value) === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: ProceedingsPublicationType | string) => {
    const locale = i18n.vueI18n.global.locale;

    let proceedingsPublicationTypeArray = proceedingsPublicationTypeEn;
    if (locale == "sr") {
        proceedingsPublicationTypeArray = proceedingsPublicationTypeSr;
    } else if (locale == "sr-cyr") {
        proceedingsPublicationTypeArray = transliterateContentToCyrillic(proceedingsPublicationTypeSr);
    }

    if (typeof value === "number") {
        return (proceedingsPublicationTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (proceedingsPublicationTypeArray.find(item => getNameFromOrdinal(ProceedingsPublicationType, item.value) === value) || {}).title;
    }
};

export const getTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return proceedingsPublicationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(proceedingsPublicationTypeSr);
        case "en":
            return proceedingsPublicationTypeEn;
    }
};
