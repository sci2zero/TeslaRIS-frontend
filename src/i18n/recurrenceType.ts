import { RecurrenceType } from "@/models/LoadModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const recurrenceTypeSr = [
    { title: "Jednom", value: RecurrenceType.ONCE },
    { title: "Dnevno", value: RecurrenceType.DAILY },
    { title: "Nedeljno", value: RecurrenceType.WEEKLY },
    { title: "Mesečno", value: RecurrenceType.MONTHLY },
    { title: "Svaka tri meseca", value: RecurrenceType.THREE_MONTHLY },
    { title: "Godišnje", value: RecurrenceType.YEARLY }
];

export const recurrenceTypeEn = [
    { title: "Once", value: RecurrenceType.ONCE },
    { title: "Daily", value: RecurrenceType.DAILY },
    { title: "Weekly", value: RecurrenceType.WEEKLY },
    { title: "Monthly", value: RecurrenceType.MONTHLY },
    { title: "Every three months", value: RecurrenceType.THREE_MONTHLY },
    { title: "Yearly", value: RecurrenceType.YEARLY }
];

export const getRecurrenceTypeTitleFromValueAutoLocale = (value: RecurrenceType) => {
    const locale = i18n.vueI18n.global.locale;

    let reportTypeArray = recurrenceTypeEn;
    if (locale == "sr") {
        reportTypeArray = recurrenceTypeSr;
    } else if (locale == "sr-cyr") {
        reportTypeArray = transliterateContentToCyrillic(recurrenceTypeSr);
    }

    return (reportTypeArray.find(item => item.value === value) || {}).title;
};

export const getRecurrenceTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return recurrenceTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(recurrenceTypeSr);
        case "en":
            return recurrenceTypeEn;
    }
};
