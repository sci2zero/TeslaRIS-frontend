import { EntityType } from "@/models/MergeModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const entityTypeSr = [
    { title: "Publikacije", value: EntityType.PUBLICATION },
    { title: "Osobe", value: EntityType.PERSON },
    { title: "Organizacione jedinice", value: EntityType.ORGANISATION_UNIT },
    { title: "Događaji", value: EntityType.EVENT },
    { title: "Časopisi", value: EntityType.JOURNAL },
    { title: "Serije knjiga", value: EntityType.BOOK_SERIES },
    { title: "Izdavači", value: EntityType.PUBLISHER },
    { title: "Korisnički nalozi", value: EntityType.USER_ACCOUNT },
    { title: "Poeni sa vrednovanja", value: EntityType.ASSESSMENT_POINTS },
    { title: "Projekti", value: EntityType.PROJECT },
    { title: "Finansiranja", value: EntityType.FUNDING },
    { title: "Prijave na konkurs", value: EntityType.FUNDING_APPLICATION },
    { title: "Programi finansiranja", value: EntityType.FUNDING_PROGRAM },
    { title: "Konkursi", value: EntityType.FUNDING_CALL }
];

export const entityTypeEn = [
    { title: "Publications", value: EntityType.PUBLICATION },
    { title: "People", value: EntityType.PERSON },
    { title: "Organisation units", value: EntityType.ORGANISATION_UNIT },
    { title: "Events", value: EntityType.EVENT },
    { title: "Journals", value: EntityType.JOURNAL },
    { title: "Book series", value: EntityType.BOOK_SERIES },
    { title: "Publishers", value: EntityType.PUBLISHER },
    { title: "User accounts", value: EntityType.USER_ACCOUNT },
    { title: "Assessment points", value: EntityType.ASSESSMENT_POINTS },
    { title: "Projects", value: EntityType.PROJECT },
    { title: "Fundings", value: EntityType.FUNDING },
    { title: "Funding applications", value: EntityType.FUNDING_APPLICATION },
    { title: "Funding programs", value: EntityType.FUNDING_PROGRAM },
    { title: "Funding calls", value: EntityType.FUNDING_CALL }
];

export const getEntityTypeTitleFromValueAutoLocale = (value: EntityType) => {
    const locale = i18n.vueI18n.global.locale;

    let entityTypeArray = entityTypeEn;
    if (locale == "sr") {
        entityTypeArray = entityTypeSr;
    } else if (locale == "sr-cyr") {
        entityTypeArray = transliterateContentToCyrillic(entityTypeSr);
    }

    return (entityTypeArray.find(item => item.value === value) || {}).title;
};

export const getEntityTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return entityTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(entityTypeSr);
        case "en":
            return entityTypeEn;
    }
};
