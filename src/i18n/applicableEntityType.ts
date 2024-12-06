import { ApplicableEntityType } from "@/models/Common";
import i18n from ".";

export const applicableEntityTypeSr = [
    { title: "Monografija", value: ApplicableEntityType.MONOGRAPH },
    { title: "Događaj", value: ApplicableEntityType.EVENT },
    { title: "Dokument", value: ApplicableEntityType.DOCUMENT },
    { title: "Istraživač", value: ApplicableEntityType.PERSON },
    { title: "Organizaciona jedinica", value: ApplicableEntityType.ORGANISATION_UNIT },
    { title: "Svi", value: ApplicableEntityType.ALL }
];

export const applicableEntityTypeEn = [
    { title: "Monograph", value: ApplicableEntityType.MONOGRAPH },
    { title: "Event", value: ApplicableEntityType.EVENT },
    { title: "Document", value: ApplicableEntityType.DOCUMENT },
    { title: "Researcher", value: ApplicableEntityType.PERSON },
    { title: "Organisation unit", value: ApplicableEntityType.ORGANISATION_UNIT },
    { title: "All", value: ApplicableEntityType.ALL }
];

export const getApplicableEntityTypeTitleFromValueAutoLocale = (value: ApplicableEntityType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = applicableEntityTypeEn;
    if (locale == "sr") {
        resourceTypeArray = applicableEntityTypeSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getApplicableEntityTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return applicableEntityTypeSr;
        case "en":
            return applicableEntityTypeEn;
    }
};
