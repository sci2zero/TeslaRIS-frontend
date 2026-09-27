import { ProjectEventType } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const projectEventTypeSr = [
    { title: "Sastanak", value: ProjectEventType.MEETING },
    { title: "Predstavljanje rezultata projekta", value: ProjectEventType.PROJECT_RESULTS_PRESENTED_AT },
    { title: "Javni događaj u organizaciji projekta", value: ProjectEventType.PUBLIC_EVENT_ORGANIZED_BY_PROJECT }
];

export const projectEventTypeEn = [
    { title: "Meeting", value: ProjectEventType.MEETING },
    { title: "Project results presented at", value: ProjectEventType.PROJECT_RESULTS_PRESENTED_AT },
    { title: "Public event organized by project", value: ProjectEventType.PUBLIC_EVENT_ORGANIZED_BY_PROJECT }
];

export const getProjectEventTypeTitleFromValueAutoLocale = (value: ProjectEventType) => {
    const locale = i18n.vueI18n.global.locale;

    let projectEventTypeArray = projectEventTypeEn;
    if (locale == "sr") {
        projectEventTypeArray = projectEventTypeSr;
    } else if (locale == "sr-cyr") {
        projectEventTypeArray = transliterateContentToCyrillic(projectEventTypeSr);
    }

    return (projectEventTypeArray.find(item => item.value === value) || {}).title;
};

export const getProjectEventTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return projectEventTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(projectEventTypeSr);
        case "en":
            return projectEventTypeEn;
    }
};
