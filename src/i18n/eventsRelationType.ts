import { EventsRelationType } from "@/models/EventModel";
import i18n from ".";


export const eventsRelationTypesSr = [
    { title: "Pripada seriji", value: EventsRelationType.BELONGS_TO_SERIES },
    { title: "Uspostavljeno zajedno sa", value: EventsRelationType.COLLOCATED_WITH },
    { title: "Deo od", value: EventsRelationType.PART_OF },
];

export const eventsRelationTypesEn = [
    { title: "Belongs to series", value: EventsRelationType.BELONGS_TO_SERIES },
    { title: "Collocated with", value: EventsRelationType.COLLOCATED_WITH },
    { title: "Part of", value: EventsRelationType.PART_OF },
];

export const getEventsRelationTitleFromValueAutoLocale = (value: EventsRelationType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = eventsRelationTypesEn;
    if (locale == "sr") {
        resourceTypeArray = eventsRelationTypesSr;
    }
    
    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getEventsRelationTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return eventsRelationTypesSr;
        case "en":
            return eventsRelationTypesEn;
    }
}
