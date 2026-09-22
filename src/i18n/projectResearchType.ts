import { ProjectResearchType } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const projectResearchTypeSr = [
    { title: "Fundamentalno istraživanje", value: ProjectResearchType.FUNDAMENTAL },
    { title: "Inovacija", value: ProjectResearchType.INNOVATION },
    { title: "Razvojno (primenjeno)", value: ProjectResearchType.DEVELOPMENT },
    { title: "Strateško", value: ProjectResearchType.STRATEGIC },
    { title: "Umrežavanje", value: ProjectResearchType.NETWORKING },
    { title: "Izgradnja kapaciteta", value: ProjectResearchType.CAPACITY_BUILDING },
    { title: "Mobilnost", value: ProjectResearchType.MOBILITY },
    { title: "Infrastruktura", value: ProjectResearchType.INFRASTRUCTURE },
    { title: "Ostalo", value: ProjectResearchType.OTHER }
];

export const projectResearchTypeEn = [
    { title: "Fundamental", value: ProjectResearchType.FUNDAMENTAL },
    { title: "Innovation", value: ProjectResearchType.INNOVATION },
    { title: "Development (applied)", value: ProjectResearchType.DEVELOPMENT },
    { title: "Strategic", value: ProjectResearchType.STRATEGIC },
    { title: "Networking", value: ProjectResearchType.NETWORKING },
    { title: "Capacity building", value: ProjectResearchType.CAPACITY_BUILDING },
    { title: "Mobility", value: ProjectResearchType.MOBILITY },
    { title: "Infrastructure", value: ProjectResearchType.INFRASTRUCTURE },
    { title: "Other", value: ProjectResearchType.OTHER }
];

export const getProjectResearchTypeTitleFromValueAutoLocale = (value: ProjectResearchType) => {
    const locale = i18n.vueI18n.global.locale;

    let projectResearchTypeArray = projectResearchTypeEn;
    if (locale == "sr") {
        projectResearchTypeArray = projectResearchTypeSr;
    } else if (locale == "sr-cyr") {
        projectResearchTypeArray = transliterateContentToCyrillic(projectResearchTypeSr);
    }

    return (projectResearchTypeArray.find(item => item.value === value) || {}).title;
};

export const getProjectResearchTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return projectResearchTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(projectResearchTypeSr);
        case "en":
            return projectResearchTypeEn;
    }
};
