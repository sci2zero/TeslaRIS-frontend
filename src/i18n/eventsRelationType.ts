import { EventsRelationType } from "@/models/EventModel";
import i18n from ".";


export const eventsRelationTypesSr = [
    { title: "Pripadnost seriji", value: EventsRelationType.BELONGS_TO_SERIES },
    { title: "Uspostavljeno zajedno sa", value: EventsRelationType.COLLOCATED_WITH },
    { title: "Deo", value: EventsRelationType.PART_OF },
    { title: "Sadržajni deo", value: EventsRelationType.HAS_PART },
];

export const eventsRelationTypesEn = [
    { title: "Belongs to series", value: EventsRelationType.BELONGS_TO_SERIES },
    { title: "Collocated with", value: EventsRelationType.COLLOCATED_WITH },
    { title: "Part of", value: EventsRelationType.PART_OF },
    { title: "Has part", value: EventsRelationType.HAS_PART },
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
            return eventsRelationTypesSr.filter(relation => relation.value !== EventsRelationType.HAS_PART);
        case "en":
            return eventsRelationTypesEn.filter(relation => relation.value !== EventsRelationType.HAS_PART);
    }
}
