import { PublicationStatus } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


const publicationStatusEn = [
    { title: "Submitted", value: PublicationStatus.SUBMITTED },
    { title: "In review", value: PublicationStatus.IN_REVIEW },
    { title: "Accepted", value: PublicationStatus.ACCEPTED },
    { title: "In print", value: PublicationStatus.IN_PRINT },
    { title: "Published", value: PublicationStatus.PUBLISHED }
];

const publicationStatusSr = [
    { title: "Podneto za objavljivanje", value: PublicationStatus.SUBMITTED },
    { title: "U procesu recenzije", value: PublicationStatus.IN_REVIEW },
    { title: "Prihvaćeno", value: PublicationStatus.ACCEPTED },
    { title: "U procesu štampe", value: PublicationStatus.IN_PRINT },
    { title: "Objavljeno", value: PublicationStatus.PUBLISHED }
];

export const getTitleFromValue = (value: PublicationStatus, publicationStatusArray: {title: string, value: PublicationStatus}[]) => {
    return (publicationStatusArray.find(item => item.value === value.toString()) || {}).title;
};

export const getPublicationStatusTitleFromValueAutoLocale = (value: PublicationStatus) => {
    const locale = i18n.vueI18n.global.locale;

    let publicationStatusArray = publicationStatusEn;
    if (locale == "sr") {
        publicationStatusArray = publicationStatusSr;
    } else if (locale == "sr-cyr") {
        publicationStatusArray = transliterateContentToCyrillic(publicationStatusSr);
    }

    return (publicationStatusArray.find(item => item.value === value) || {}).title;
};

export const getPublicationStatusesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return publicationStatusSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(publicationStatusSr);
        case "en":
            return publicationStatusEn;
    }
};
