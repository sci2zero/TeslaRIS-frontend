import { EntityType } from "@/models/MergeModel";
import i18n from ".";

export const entityTypeSr = [
    { title: "Publikacije", value: EntityType.PUBLICATION },
    { title: "Osobe", value: EntityType.PERSON },
    { title: "Organizacione jedinice", value: EntityType.ORGANISATION_UNIT },
    { title: "Događaji", value: EntityType.EVENT },
    { title: "Časopisi", value: EntityType.JOURNAL },
    { title: "Serije knjiga", value: EntityType.BOOK_SERIES },
    { title: "Izdavači", value: EntityType.PUBLISHER },
    { title: "Korisnički nalozi", value: EntityType.USER_ACCOUNT }
];

export const entityTypeEn = [
    { title: "Publications", value: EntityType.PUBLICATION },
    { title: "People", value: EntityType.PERSON },
    { title: "Organisation units", value: EntityType.ORGANISATION_UNIT },
    { title: "Events", value: EntityType.EVENT },
    { title: "Journals", value: EntityType.JOURNAL },
    { title: "Book series", value: EntityType.BOOK_SERIES },
    { title: "Publishers", value: EntityType.PUBLISHER },
    { title: "User accounts", value: EntityType.USER_ACCOUNT }
];

export const getEntityTypeTitleFromValueAutoLocale = (value: EntityType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = entityTypeEn;
    if (locale == "sr") {
        resourceTypeArray = entityTypeSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getEntityTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return entityTypeSr;
        case "en":
            return entityTypeEn;
    }
};
