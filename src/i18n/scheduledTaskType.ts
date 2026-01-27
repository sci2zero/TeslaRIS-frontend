import { ScheduledTaskType } from "@/models/Common";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const scheduledTaskTypeSr = [
    { title: "Reindeksiranje", value: ScheduledTaskType.REINDEXING },
    { title: "Učitavanje indikatora", value: ScheduledTaskType.INDICATOR_LOAD },
    { title: "Računanje IF5 i JCI rank-a", value: ScheduledTaskType.IF5_JCI_COMPUTATION },
    { title: "Klasifikacija časopisa", value: ScheduledTaskType.CLASSIFICATION_COMPUTATION },
    { title: "Učitavanje klasifikacija časopisa", value: ScheduledTaskType.CLASSIFICATION_LOAD },
    { title: "Vrednovanje radova u časopisima", value: ScheduledTaskType.JOURNAL_PUBLICATIONS_ASSESSMENT },
    { title: "Vrednovanje radova na konferencijama", value: ScheduledTaskType.PROCEEDINGS_PUBLICATIONS_ASSESSMENT },
    { title: "Vrednovanje završnih radova", value: ScheduledTaskType.THESES_ASSESSMENT },
    { title: "Vrednovanje radova u monografijama", value: ScheduledTaskType.MONOGRAPH_PUBLICATIONS_ASSESSMENT },
    { title: "Generisanje izveštaja", value: ScheduledTaskType.REPORT_GENERATION },
    { title: "Brisanje neuvezanih publikacija", value: ScheduledTaskType.UNMANAGED_DOCUMENTS_DELETION },
    { title: "Sklanjanje sa javnog uvida", value: ScheduledTaskType.PUBLIC_REVIEW_END_DATE_CHECK },
    { title: "Održavanje", value: ScheduledTaskType.MAINTENANCE }
];

export const scheduledTaskTypeEn = [
    { title: "Reindexing", value: ScheduledTaskType.REINDEXING },
    { title: "Indicator load", value: ScheduledTaskType.INDICATOR_LOAD },
    { title: "IF5 and JCI rank computation", value: ScheduledTaskType.IF5_JCI_COMPUTATION },
    { title: "Journal classification", value: ScheduledTaskType.CLASSIFICATION_COMPUTATION },
    { title: "Journal classification load", value: ScheduledTaskType.CLASSIFICATION_LOAD },
    { title: "Journal publications assessment", value: ScheduledTaskType.JOURNAL_PUBLICATIONS_ASSESSMENT },
    { title: "Proceedings publications assessment", value: ScheduledTaskType.PROCEEDINGS_PUBLICATIONS_ASSESSMENT },
    { title: "Theses assessment", value: ScheduledTaskType.THESES_ASSESSMENT },
    { title: "Monograph publications assessment", value: ScheduledTaskType.MONOGRAPH_PUBLICATIONS_ASSESSMENT },
    { title: "Report generation", value: ScheduledTaskType.REPORT_GENERATION },
    { title: "Non-managed publications deletion", value: ScheduledTaskType.UNMANAGED_DOCUMENTS_DELETION },
    { title: "Public review removal", value: ScheduledTaskType.PUBLIC_REVIEW_END_DATE_CHECK },
    { title: "Maintenance", value: ScheduledTaskType.MAINTENANCE }
];

export const getScheduledTaskTypeTitleFromValueAutoLocale = (value: ScheduledTaskType) => {
    const locale = i18n.vueI18n.global.locale;

    let scheduledtaskTypeArray = scheduledTaskTypeEn;
    if (locale == "sr") {
        scheduledtaskTypeArray = scheduledTaskTypeSr;
    } else if (locale == "sr-cyr") {
        scheduledtaskTypeArray = transliterateContentToCyrillic(scheduledTaskTypeSr);
    }

    return (scheduledtaskTypeArray.find(item => item.value === value) || {}).title;
};

export const getScheduledTaskTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return scheduledTaskTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(scheduledTaskTypeSr);
        case "en":
            return scheduledTaskTypeEn;
    }
};
