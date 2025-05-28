import { IndicatorContentType } from "@/models/AssessmentModel";
import i18n from ".";

export const indicatorContentTypeSr = [
    { title: "Tekst", value: IndicatorContentType.TEXT },
    { title: "Da/Ne vrednost", value: IndicatorContentType.BOOL },
    { title: "Broj", value: IndicatorContentType.NUMBER },
    { title: "Bilo šta", value: IndicatorContentType.ANYTHING }
];

export const indicatorContentTypeEn = [
    { title: "Text", value: IndicatorContentType.TEXT },
    { title: "Yes/No value", value: IndicatorContentType.BOOL },
    { title: "Number", value: IndicatorContentType.NUMBER },
    { title: "Anything", value: IndicatorContentType.ANYTHING }
];

export const getIndicatorContentTypeTitleFromValueAutoLocale = (value: IndicatorContentType) => {
    const locale = i18n.vueI18n.global.locale;

    let indicatorContentTypeArray = indicatorContentTypeEn;
    if (locale == "sr") {
        indicatorContentTypeArray = indicatorContentTypeSr;
    }

    return (indicatorContentTypeArray.find(item => item.value === value) || {}).title;
};

export const getIndicatorContentTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return indicatorContentTypeSr;
        case "en":
            return indicatorContentTypeEn;
    }
};
