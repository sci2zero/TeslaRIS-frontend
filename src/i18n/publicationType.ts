import { PublicationType } from "@/models/PublicationModel";
import i18n from ".";

const publicationTypeEn = [
    { title: "Journal Publication", value: PublicationType.JOURNAL_PUBLICATION },
    { title: "Proceedings Publication", value: PublicationType.PROCEEDINGS_PUBLICATION },
    { title: "Patent", value: PublicationType.PATENT },
    { title: "Proceedings", value: PublicationType.PROCEEDINGS },
    { title: "Dataset", value: PublicationType.DATASET },
    { title: "Software", value: PublicationType.SOFTWARE },
    { title: "Monograph", value: PublicationType.MONOGRAPH }
];

const publicationTypeSr = [
    { title: "Rad u časopisu", value: PublicationType.JOURNAL_PUBLICATION },
    { title: "Rad u zborniku radova", value: PublicationType.PROCEEDINGS_PUBLICATION },
    { title: "Patent", value: PublicationType.PATENT },
    { title: "Zbornik radova", value: PublicationType.PROCEEDINGS },
    { title: "Skup podataka", value: PublicationType.DATASET },
    { title: "Softver", value: PublicationType.SOFTWARE },
    { title: "Monografija", value: PublicationType.MONOGRAPH }
];

export const getTitleFromValue = (value: PublicationType, resourceTypeArray: {title: string, value: PublicationType}[]) => {
    return (resourceTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getPublicationTypeTitleFromValueAutoLocale = (value: PublicationType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = publicationTypeEn;
    if (locale == "sr") {
        resourceTypeArray = publicationTypeSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getPublicationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return publicationTypeSr;
        case "en":
            return publicationTypeEn;
    }
}
