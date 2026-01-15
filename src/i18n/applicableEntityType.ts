import { ApplicableEntityType } from "@/models/Common";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";
import { PublicationType } from "@/models/PublicationModel";


export const applicableEntityTypeSr = [
    { title: "Monografija", value: ApplicableEntityType.MONOGRAPH },
    { title: "Rad u monografiji", value: ApplicableEntityType.MONOGRAPH_PUBLICATION },
    { title: "Događaj", value: ApplicableEntityType.EVENT },
    { title: "Dokument", value: ApplicableEntityType.DOCUMENT },
    { title: "Istraživač", value: ApplicableEntityType.PERSON },
    { title: "Organizaciona jedinica", value: ApplicableEntityType.ORGANISATION_UNIT },
    { title: "Serija publikacija", value: ApplicableEntityType.PUBLICATION_SERIES },
    { title: "Svi", value: ApplicableEntityType.ALL }
];

export const applicableEntityTypeEn = [
    { title: "Monograph", value: ApplicableEntityType.MONOGRAPH },
    { title: "Monograph publication", value: ApplicableEntityType.MONOGRAPH_PUBLICATION },
    { title: "Event", value: ApplicableEntityType.EVENT },
    { title: "Document", value: ApplicableEntityType.DOCUMENT },
    { title: "Researcher", value: ApplicableEntityType.PERSON },
    { title: "Organisation unit", value: ApplicableEntityType.ORGANISATION_UNIT },
    { title: "Publication series", value: ApplicableEntityType.PUBLICATION_SERIES },
    { title: "All", value: ApplicableEntityType.ALL }
];

export const getApplicableEntityTypeTitleFromValueAutoLocale = (value: ApplicableEntityType) => {
    const locale = i18n.vueI18n.global.locale;

    let applicableEntityTypeArray = applicableEntityTypeEn;
    if (locale == "sr") {
        applicableEntityTypeArray = applicableEntityTypeSr;
    } else if (locale == "sr-cyr") {
        applicableEntityTypeArray = transliterateContentToCyrillic(applicableEntityTypeSr);
    }

    return (applicableEntityTypeArray.find(item => item.value === value) || {}).title;
};

export const getApplicableEntityTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return applicableEntityTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(applicableEntityTypeSr);
        case "en":
            return applicableEntityTypeEn;
    }
};

export const getApplicableEntityTypeForDocumentType = (documentType: PublicationType) => {
    switch(documentType) {
        case PublicationType.MONOGRAPH:
            return ApplicableEntityType.MONOGRAPH;
        case PublicationType.MONOGRAPH_PUBLICATION:
            return ApplicableEntityType.MONOGRAPH_PUBLICATION;
        default:
            return ApplicableEntityType.DOCUMENT;
    }
};
