import { EventType } from "@/models/EventModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const eventTypeEn = [
    { title: "Conference", value: EventType.CONFERENCE },
    { title: "Exhibition", value: EventType.EXHIBITION },
    { title: "Course", value: EventType.COURSE },
    { title: "OtherEvent", value: EventType.OTHER_EVENT }
];

export const eventTypeSr = [
    { title: "Konferencija", value: EventType.CONFERENCE },
    { title: "Izložba", value: EventType.EXHIBITION },
    { title: "Kurs", value: EventType.COURSE },
    { title: "Drugi tip događaja", value: EventType.OTHER_EVENT },
];

export const getEventTypeTitleFromValue = (
    value: EventType, eventTypeArray: {title: string, value: EventType}[]
) => {
    return (eventTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getEventTypeTitleFromValueAutoLocale = (
    value: EventType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let eventTypeArray = eventTypeEn;
    if (locale == "sr") {
        eventTypeArray = eventTypeSr;
    } else if (locale == "sr-cyr") {
        eventTypeArray = transliterateContentToCyrillic(eventTypeSr);
    }

    return (eventTypeArray.find(item => item.value === value) || {}).title;
};

export const getEventTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return eventTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(eventTypeSr);
        case "en":
            return eventTypeEn;
    }
};
