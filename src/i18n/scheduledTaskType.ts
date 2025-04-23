import { ScheduledTaskType } from "@/models/Common";
import i18n from ".";

export const scheduledTaskTypeSr = [
    { title: "Reindeksiranje", value: ScheduledTaskType.REINDEXING },
    { title: "Učitavanje indikatora", value: ScheduledTaskType.INDICATOR_LOAD },
    { title: "Računanje IF5 rank-a", value: ScheduledTaskType.IF5_COMPUTATION },
    { title: "Klasifikacija časopisa", value: ScheduledTaskType.CLASSIFICATION_COMPUTATION },
    { title: "Učitavanje klasifikacija časopisa", value: ScheduledTaskType.CLASSIFICATION_LOAD },
    { title: "Vrednovanje radova u časopisima", value: ScheduledTaskType.JOURNAL_PUBLICATIONS_ASSESSMENT },
    { title: "Vrednovanje radova na konferencijama", value: ScheduledTaskType.PROCEEDINGS_PUBLICATIONS_ASSESSMENT },
    { title: "Generisanje izveštaja", value: ScheduledTaskType.REPORT_GENERATION }
];

export const scheduledTaskTypeEn = [
    { title: "Reindexing", value: ScheduledTaskType.REINDEXING },
    { title: "Indicator load", value: ScheduledTaskType.INDICATOR_LOAD },
    { title: "IF5 rank computation", value: ScheduledTaskType.IF5_COMPUTATION },
    { title: "Journal classification", value: ScheduledTaskType.CLASSIFICATION_COMPUTATION },
    { title: "Journal classification load", value: ScheduledTaskType.CLASSIFICATION_LOAD },
    { title: "Journal publications assessment", value: ScheduledTaskType.JOURNAL_PUBLICATIONS_ASSESSMENT },
    { title: "Proceedings publications assessment", value: ScheduledTaskType.PROCEEDINGS_PUBLICATIONS_ASSESSMENT },
    { title: "Report generation", value: ScheduledTaskType.REPORT_GENERATION }
];

export const getScheduledTaskTypeTitleFromValueAutoLocale = (value: ScheduledTaskType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = scheduledTaskTypeEn;
    if (locale == "sr") {
        resourceTypeArray = scheduledTaskTypeSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getScheduledTaskTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return scheduledTaskTypeSr;
        case "en":
            return scheduledTaskTypeEn;
    }
};
