import { ProjectCollaborationType } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const projectCollaborationTypeSr = [
    { title: "Interni", value: ProjectCollaborationType.INTERNAL },
    { title: "Međunarodni bilateralni", value: ProjectCollaborationType.INTERNATIONAL_BILATERAL },
    { title: "Međunarodni multilateralni", value: ProjectCollaborationType.INTERNATIONAL_MULTILATERAL },
    { title: "Nacionalni", value: ProjectCollaborationType.NATIONAL }
];

export const projectCollaborationTypeEn = [
    { title: "Internal", value: ProjectCollaborationType.INTERNAL },
    { title: "International bilateral", value: ProjectCollaborationType.INTERNATIONAL_BILATERAL },
    { title: "International multilateral", value: ProjectCollaborationType.INTERNATIONAL_MULTILATERAL },
    { title: "National", value: ProjectCollaborationType.NATIONAL }
];

export const getProjectCollaborationTypeTitleFromValueAutoLocale = (value: ProjectCollaborationType) => {
    const locale = i18n.vueI18n.global.locale;

    let projectCollaborationTypeArray = projectCollaborationTypeEn;
    if (locale == "sr") {
        projectCollaborationTypeArray = projectCollaborationTypeSr;
    } else if (locale == "sr-cyr") {
        projectCollaborationTypeArray = transliterateContentToCyrillic(projectCollaborationTypeSr);
    }

    return (projectCollaborationTypeArray.find(item => item.value === value) || {}).title;
};

export const getProjectCollaborationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return projectCollaborationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(projectCollaborationTypeSr);
        case "en":
            return projectCollaborationTypeEn;
    }
};
