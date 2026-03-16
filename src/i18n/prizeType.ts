import { PrizeType } from "@/models/PersonModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const prizeTypeSr = [
    { title: "Priznanje", value: PrizeType.AWARD },
    { title: "Titula", value: PrizeType.TITLE },
    { title: "Ostalo", value: PrizeType.OTHER }
];

export const prizeTypeEn = [
    { title: "Award", value: PrizeType.AWARD },
    { title: "Title", value: PrizeType.TITLE },
    { title: "Other", value: PrizeType.OTHER }
];

export const getPrizeTypeTitleFromValueAutoLocale = (value: PrizeType) => {
    const locale = i18n.vueI18n.global.locale;

    let prizeTypeArray = prizeTypeEn;
    if (locale == "sr") {
        prizeTypeArray = prizeTypeSr;
    } else if (locale == "sr-cyr") {
        prizeTypeArray = transliterateContentToCyrillic(prizeTypeSr);
    }

    return (prizeTypeArray.find(item => item.value === value) || {}).title;
};

export const getPrizeTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return prizeTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(prizeTypeSr);
        case "en":
            return prizeTypeEn;
    }
};
