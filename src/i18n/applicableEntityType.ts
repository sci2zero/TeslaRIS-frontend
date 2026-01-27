import { ApplicableEntityType } from "@/models/Common";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";
import { PublicationType } from "@/models/PublicationModel";


export const applicableEntityTypeSr = [
    { title: "Monografija", value: ApplicableEntityType.MONOGRAPH },
    { title: "Rad u monografiji", value: ApplicableEntityType.MONOGRAPH_PUBLICATION },
    { title: "Rad u časopisu", value: ApplicableEntityType.JOURNAL_PUBLICATION },
    { title: "Rad sa konferencije", value: ApplicableEntityType.PROCEEDINGS_PUBLICATION },
    { title: "Patent", value: ApplicableEntityType.PATENT },
    { title: "Materijalni proizvod", value: ApplicableEntityType.MATERIAL_PRODUCT },
    { title: "Genetski materijal", value: ApplicableEntityType.GENETIC_MATERIAL },
    { title: "Skup podataka", value: ApplicableEntityType.DATASET },
    { title: "Završni rad", value: ApplicableEntityType.THESIS },
    { title: "Događaj", value: ApplicableEntityType.EVENT },
    { title: "Dokument", value: ApplicableEntityType.DOCUMENT },
    { title: "Istraživač", value: ApplicableEntityType.PERSON },
    { title: "Organizaciona jedinica", value: ApplicableEntityType.ORGANISATION_UNIT },
    { title: "Serija publikacija", value: ApplicableEntityType.PUBLICATION_SERIES },
    { title: "Nagrada", value: ApplicableEntityType.PRIZE },
    { title: "Svi", value: ApplicableEntityType.ALL }
];

export const applicableEntityTypeEn = [
    { title: "Monograph", value: ApplicableEntityType.MONOGRAPH },
    { title: "Monograph publication", value: ApplicableEntityType.MONOGRAPH_PUBLICATION },
    { title: "Journal publication", value: ApplicableEntityType.JOURNAL_PUBLICATION },
    { title: "Proceedings publication", value: ApplicableEntityType.PROCEEDINGS_PUBLICATION },
    { title: "Patent", value: ApplicableEntityType.PATENT },
    { title: "Material product", value: ApplicableEntityType.MATERIAL_PRODUCT },
    { title: "Genetic material", value: ApplicableEntityType.GENETIC_MATERIAL },
    { title: "Dataset", value: ApplicableEntityType.DATASET },
    { title: "Thesis", value: ApplicableEntityType.THESIS },
    { title: "Event", value: ApplicableEntityType.EVENT },
    { title: "Document", value: ApplicableEntityType.DOCUMENT },
    { title: "Researcher", value: ApplicableEntityType.PERSON },
    { title: "Organisation unit", value: ApplicableEntityType.ORGANISATION_UNIT },
    { title: "Publication series", value: ApplicableEntityType.PUBLICATION_SERIES },
    { title: "Prize", value: ApplicableEntityType.PRIZE },
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
        case PublicationType.JOURNAL_PUBLICATION:
            return ApplicableEntityType.JOURNAL_PUBLICATION;
        case PublicationType.PROCEEDINGS_PUBLICATION:
            return ApplicableEntityType.PROCEEDINGS_PUBLICATION;
        case PublicationType.PATENT:
            return ApplicableEntityType.PATENT;
        case PublicationType.MATERIAL_PRODUCT:
        case PublicationType.INTANGIBLE_PRODUCT:
            return ApplicableEntityType.INTANGIBLE_PRODUCT;
        case PublicationType.GENETIC_MATERIAL:
            return ApplicableEntityType.GENETIC_MATERIAL;
        case PublicationType.DATASET:
            return ApplicableEntityType.DATASET;
        case PublicationType.THESIS:
            return ApplicableEntityType.THESIS;
        default:
            return ApplicableEntityType.DOCUMENT;
    }
};
