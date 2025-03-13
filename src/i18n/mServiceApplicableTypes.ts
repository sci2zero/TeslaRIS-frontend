import { MServiceApplicableTypes } from "@/models/PublicationModel";
import i18n from ".";

export const mServiceApplicableTypesSr = [
    { title: "Rad u časopisu", value: MServiceApplicableTypes.JOURNAL_PUBLICATION },
    { title: "Rad na konferenciji", value: MServiceApplicableTypes.PROCEEDINGS_PUBLICATION },
];

export const mServiceApplicableTypesEn = [
    { title: "Journal publication", value: MServiceApplicableTypes.JOURNAL_PUBLICATION },
    { title: "Conference publication", value: MServiceApplicableTypes.PROCEEDINGS_PUBLICATION },
];

export const getMServiceApplicableTypeTitleFromValueAutoLocale = (value: MServiceApplicableTypes) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = mServiceApplicableTypesEn;
    if (locale == "sr") {
        resourceTypeArray = mServiceApplicableTypesSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getMServiceApplicableTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return mServiceApplicableTypesSr;
        case "en":
            return mServiceApplicableTypesEn;
    }
};
