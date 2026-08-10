import { ProjectsRelationType } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const projectsRelationTypeSr = [
    { title: "Deo projekta", value: ProjectsRelationType.PART_OF },
    { title: "Prethodnik", value: ProjectsRelationType.PREDECESSOR }
];

export const projectsRelationTypeEn = [
    { title: "Part of", value: ProjectsRelationType.PART_OF },
    { title: "Predecessor", value: ProjectsRelationType.PREDECESSOR }
];

export const getProjectsRelationTypeTitleFromValueAutoLocale = (value: ProjectsRelationType) => {
    const locale = i18n.vueI18n.global.locale;

    let projectsRelationTypeArray = projectsRelationTypeEn;
    if (locale == "sr") {
        projectsRelationTypeArray = projectsRelationTypeSr;
    } else if (locale == "sr-cyr") {
        projectsRelationTypeArray = transliterateContentToCyrillic(projectsRelationTypeSr);
    }

    return (projectsRelationTypeArray.find(item => item.value === value) || {}).title;
};

export const getProjectsRelationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return projectsRelationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(projectsRelationTypeSr);
        case "en":
            return projectsRelationTypeEn;
    }
};
