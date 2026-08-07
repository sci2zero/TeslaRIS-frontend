import { ProjectDocumentType } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const projectDocumentTypeSr = [
    { title: "Izveštaj", value: ProjectDocumentType.REPORT },
    { title: "Rezultat", value: ProjectDocumentType.RESULT },
    { title: "Korišćen", value: ProjectDocumentType.USED },
    { title: "Interni dokument", value: ProjectDocumentType.INTERNAL }
];

export const projectDocumentTypeEn = [
    { title: "Report", value: ProjectDocumentType.REPORT },
    { title: "Result", value: ProjectDocumentType.RESULT },
    { title: "Used", value: ProjectDocumentType.USED },
    { title: "Internal document", value: ProjectDocumentType.INTERNAL }
];

export const getProjectDocumentTypeTitleFromValueAutoLocale = (value: ProjectDocumentType) => {
    const locale = i18n.vueI18n.global.locale;

    let projectDocumentTypeArray = projectDocumentTypeEn;
    if (locale == "sr") {
        projectDocumentTypeArray = projectDocumentTypeSr;
    } else if (locale == "sr-cyr") {
        projectDocumentTypeArray = transliterateContentToCyrillic(projectDocumentTypeSr);
    }

    return (projectDocumentTypeArray.find(item => item.value === value) || {}).title;
};

export const getProjectDocumentTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return projectDocumentTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(projectDocumentTypeSr);
        case "en":
            return projectDocumentTypeEn;
    }
};
