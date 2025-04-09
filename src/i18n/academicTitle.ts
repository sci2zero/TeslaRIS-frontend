
import { AcademicTitle } from "@/models/ThesisLibraryModel";
import i18n from ".";


const academicTitlesEn = [
    { title: "Basic academic studies", value: AcademicTitle.BASIC_ACADEMIC_STUDIES },
    { title: "Master academic studies", value: AcademicTitle.MASTER_ACADEMIC_STUDIES },
    { title: "Integrated academic studies", value: AcademicTitle.INTEGRATED_ACADEMIC_STUDIES },
    { title: "Specialized academic studies", value: AcademicTitle.SPECIALIZED_ACADEMIC_STUDIES },
    { title: "Magister studies", value: AcademicTitle.MAGISTER_STUDIES }
];

const academicTitlesSr = [
    { title: "Osnovne akademske studije (OAS)", value: AcademicTitle.BASIC_ACADEMIC_STUDIES },
    { title: "Master akademske studije (MAS)", value: AcademicTitle.MASTER_ACADEMIC_STUDIES },
    { title: "Integrisane akademske studije (IAS)", value: AcademicTitle.INTEGRATED_ACADEMIC_STUDIES },
    { title: "Specijalističke akademske studije (SAS)", value: AcademicTitle.SPECIALIZED_ACADEMIC_STUDIES },
    { title: "Magistarske studije (MS)", value: AcademicTitle.MAGISTER_STUDIES }
];

export const getAcademicTitleFromValueAutoLocale = (value: AcademicTitle) => {
    const locale = i18n.vueI18n.global.locale;
    
    let resourceTypeArray = academicTitlesEn;
    if (locale == "sr") {
        resourceTypeArray = academicTitlesSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getAcademicTitlesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return academicTitlesSr;
        case "en":
            return academicTitlesEn;
    }
};
