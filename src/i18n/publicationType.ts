import { PublicationType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

const publicationTypeEn = [
    { title: "Journal Publication", value: PublicationType.JOURNAL_PUBLICATION },
    { title: "Conference Publication", value: PublicationType.PROCEEDINGS_PUBLICATION },
    { title: "Patent", value: PublicationType.PATENT },
    { title: "Proceedings", value: PublicationType.PROCEEDINGS },
    { title: "Dataset", value: PublicationType.DATASET },
    { title: "Software", value: PublicationType.SOFTWARE },
    { title: "Monograph", value: PublicationType.MONOGRAPH },
    { title: "Monograph publication", value: PublicationType.MONOGRAPH_PUBLICATION },
    { title: "Thesis", value: PublicationType.THESIS }
];

const publicationTypeSr = [
    { title: "Rad u časopisu", value: PublicationType.JOURNAL_PUBLICATION },
    { title: "Rad sa konferencije", value: PublicationType.PROCEEDINGS_PUBLICATION },
    { title: "Patent", value: PublicationType.PATENT },
    { title: "Zbornik radova", value: PublicationType.PROCEEDINGS },
    { title: "Skup podataka", value: PublicationType.DATASET },
    { title: "Softver", value: PublicationType.SOFTWARE },
    { title: "Monografija", value: PublicationType.MONOGRAPH },
    { title: "Rad u monografiji", value: PublicationType.MONOGRAPH_PUBLICATION },
    { title: "Završni rad", value: PublicationType.THESIS }
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
