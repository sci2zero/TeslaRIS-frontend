import { ProjectStatus } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const projectStatusSr = [
    { title: "Podnet", value: ProjectStatus.SUBMITTED },
    { title: "U proceni", value: ProjectStatus.UNDER_EVALUATION },
    { title: "U toku", value: ProjectStatus.ONGOING },
    { title: "Otkazan", value: ProjectStatus.CANCELLED },
    { title: "Završen", value: ProjectStatus.CONCLUDED }
];

export const projectStatusEn = [
    { title: "Submitted", value: ProjectStatus.SUBMITTED },
    { title: "Under evaluation", value: ProjectStatus.UNDER_EVALUATION },
    { title: "Ongoing", value: ProjectStatus.ONGOING },
    { title: "Cancelled", value: ProjectStatus.CANCELLED },
    { title: "Concluded", value: ProjectStatus.CONCLUDED }
];

export const getProjectStatusTitleFromValueAutoLocale = (value: ProjectStatus) => {
    const locale = i18n.vueI18n.global.locale;

    let projectStatusArray = projectStatusEn;
    if (locale == "sr") {
        projectStatusArray = projectStatusSr;
    } else if (locale == "sr-cyr") {
        projectStatusArray = transliterateContentToCyrillic(projectStatusSr);
    }

    return (projectStatusArray.find(item => item.value === value) || {}).title;
};

export const getProjectStatusesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return projectStatusSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(projectStatusSr);
        case "en":
            return projectStatusEn;
    }
};
