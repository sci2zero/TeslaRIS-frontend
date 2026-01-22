import { IntangibleProductType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const intangibleProductTypeEn = [
    { title: "Software", value: IntangibleProductType.SOFTWARE },
    { title: "Model", value: IntangibleProductType.MODEL },
    { title: "Process", value: IntangibleProductType.PROCESS },
    { title: "Method", value: IntangibleProductType.METHOD },
    { title: "Strategy", value: IntangibleProductType.STRATEGY },
    { title: "Policy", value: IntangibleProductType.POLICY },
    { title: "Framework", value: IntangibleProductType.FRAMEWORK },
    { title: "Other", value: IntangibleProductType.OTHER }
];

export const intangibleProductTypeSr = [
    { title: "Softver", value: IntangibleProductType.SOFTWARE },
    { title: "Model", value: IntangibleProductType.MODEL },
    { title: "Proces", value: IntangibleProductType.PROCESS },
    { title: "Metoda", value: IntangibleProductType.METHOD },
    { title: "Strategija", value: IntangibleProductType.STRATEGY },
    { title: "Politika", value: IntangibleProductType.POLICY },
    { title: "Radni okvir", value: IntangibleProductType.FRAMEWORK },
    { title: "Ostalo", value: IntangibleProductType.OTHER }
];

export const getIntangibleProductTypeTitleFromValue = (
    value: IntangibleProductType, intangibleProductTypeArray: {title: string, value: IntangibleProductType}[]
) => {
    return (intangibleProductTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getIntangibleProductTypeTitleFromValueAutoLocale = (
    value: IntangibleProductType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let intangibleProductTypeArray = intangibleProductTypeEn;
    if (locale == "sr") {
        intangibleProductTypeArray = intangibleProductTypeSr;
    } else if (locale == "sr-cyr") {
        intangibleProductTypeArray = transliterateContentToCyrillic(intangibleProductTypeSr);
    }

    return (intangibleProductTypeArray.find(item => item.value === value) || {}).title;
};

export const getIntangibleProductTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return intangibleProductTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(intangibleProductTypeSr);
        case "en":
            return intangibleProductTypeEn;
    }
};
