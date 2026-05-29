import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";
import { OtherEventType } from "@/models/EventModel";


export const otherEventTypeSr = [
    { title: "Ceremonija", value: OtherEventType.CEREMONY },
    { title: "Predavanje", value: OtherEventType.LECTURE },
    { title: "Performans", value: OtherEventType.PERFORMANCE },
    { title: "Predstava", value: OtherEventType.PLAY },
    { title: "Odbrana završnog rada", value: OtherEventType.THESIS_DEFENCE },
    { title: "Eksperiment/Proba/Suđenje", value: OtherEventType.TRIAL },
    { title: "Vebinar", value: OtherEventType.WEBINAR }
];

export const otherEventTypeEn = [
    { title: "Ceremony", value: OtherEventType.CEREMONY },
    { title: "Lecture", value: OtherEventType.LECTURE },
    { title: "Performance", value: OtherEventType.PERFORMANCE },
    { title: "Play", value: OtherEventType.PLAY },
    { title: "Thesis defence", value: OtherEventType.THESIS_DEFENCE },
    { title: "Trial", value: OtherEventType.TRIAL },
    { title: "Webinar", value: OtherEventType.WEBINAR }
];

export const getOtherEventTypeTitleFromValueAutoLocale = (value: OtherEventType) => {
    const locale = i18n.vueI18n.global.locale;

    let otherEventTypeArray = otherEventTypeEn;
    if (locale == "sr") {
        otherEventTypeArray = otherEventTypeSr;
    } else if (locale == "sr-cyr") {
        otherEventTypeArray = transliterateContentToCyrillic(otherEventTypeSr);
    }

    return (otherEventTypeArray.find(item => item.value === value) || {}).title;
};

export const getOtherEventTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return otherEventTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(otherEventTypeEn);
        case "en":
            return otherEventTypeEn;
    }
};
