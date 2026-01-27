import { PublicationType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

const publicationTypeEn = [
    { title: "Journal publication", value: PublicationType.JOURNAL_PUBLICATION },
    { title: "Conference publication", value: PublicationType.PROCEEDINGS_PUBLICATION },
    { title: "Monograph", value: PublicationType.MONOGRAPH },
    { title: "Monograph publication", value: PublicationType.MONOGRAPH_PUBLICATION },
    { title: "Thesis", value: PublicationType.THESIS },
    { title: "Patent", value: PublicationType.PATENT },
    { title: "Intangible product", value: PublicationType.INTANGIBLE_PRODUCT },
    { title: "Dataset", value: PublicationType.DATASET },
    { title: "Proceedings", value: PublicationType.PROCEEDINGS },
    { title: "Material product", value: PublicationType.MATERIAL_PRODUCT },
    { title: "Genetic material", value: PublicationType.GENETIC_MATERIAL }
];

const publicationTypeSr = [
    { title: "Rad u časopisu", value: PublicationType.JOURNAL_PUBLICATION },
    { title: "Rad sa konferencije", value: PublicationType.PROCEEDINGS_PUBLICATION },
    { title: "Monografija", value: PublicationType.MONOGRAPH },
    { title: "Rad u monografiji", value: PublicationType.MONOGRAPH_PUBLICATION },
    { title: "Završni rad", value: PublicationType.THESIS },
    { title: "Patent", value: PublicationType.PATENT },
    { title: "Nematerijalni proizvod", value: PublicationType.INTANGIBLE_PRODUCT },
    { title: "Skup podataka", value: PublicationType.DATASET },
    { title: "Zbornik radova", value: PublicationType.PROCEEDINGS },
    { title: "Materijalni proizvod", value: PublicationType.MATERIAL_PRODUCT },
    { title: "Genetski materijal", value: PublicationType.GENETIC_MATERIAL }
];

export const getTitleFromValue = (value: PublicationType, publicationTypeArray: {title: string, value: PublicationType}[]) => {
    return (publicationTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getPublicationTypeTitleFromValueAutoLocale = (value: PublicationType) => {
    const locale = i18n.vueI18n.global.locale;

    let publicationTypeArray = publicationTypeEn;
    if (locale == "sr") {
        publicationTypeArray = publicationTypeSr;
    } else if (locale == "sr-cyr") {
        publicationTypeArray = transliterateContentToCyrillic(publicationTypeSr);
    }

    return (publicationTypeArray.find(item => item.value === value) || {}).title;
};

export const getPublicationTypeValueFromTitleAutoLocale = (title: string) => {
    const locale = i18n.vueI18n.global.locale;

    let publicationTypeArray = publicationTypeEn;
    if (locale == "sr") {
        publicationTypeArray = publicationTypeSr;
    } else if (locale == "sr-cyr") {
        publicationTypeArray = transliterateContentToCyrillic(publicationTypeSr);
    }

    return (publicationTypeArray.find(item => item.title === title) || {}).value;
};

export const getPublicationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return publicationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(publicationTypeSr);
        case "en":
            return publicationTypeEn;
    }
}
