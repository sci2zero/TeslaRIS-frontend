import { EmploymentTitle } from "@/models/InvolvementModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


const employmentTitlesEn = [
    { title: "Full professor", value: EmploymentTitle.FULL_PROFESSOR },
    { title: "Assistant professor", value: EmploymentTitle.ASSISTANT_PROFESSOR },
    { title: "Associate professor", value: EmploymentTitle.ASSOCIATE_PROFESSOR },
    { title: "Professor emeritus", value: EmploymentTitle.PROFESSOR_EMERITUS },
    { title: "Scientific collaborator", value: EmploymentTitle.SCIENTIFIC_COLLABORATOR },
    { title: "Senior scientific collaborator", value: EmploymentTitle.SENIOR_SCIENTIFIC_COLLABORATOR },
    { title: "Scientific advisor", value: EmploymentTitle.SCIENTIFIC_ADVISOR },
    { title: "Retired professor", value: EmploymentTitle.RETIRED_PROFESSOR },
    { title: "Professor engineer habilitated", value: EmploymentTitle.PROFESSOR_ENGINEER_HABILITATED },
    { title: "Academician", value: EmploymentTitle.ACADEMICIAN }
];

const employmentTitlesSr = [
    { title: "Redovni profesor", value: EmploymentTitle.FULL_PROFESSOR },
    { title: "Vanredni profesor", value: EmploymentTitle.ASSOCIATE_PROFESSOR },
    { title: "Docent", value: EmploymentTitle.ASSISTANT_PROFESSOR },
    { title: "Profesor emeritus", value: EmploymentTitle.PROFESSOR_EMERITUS },
    { title: "Naučni saradnik", value: EmploymentTitle.SCIENTIFIC_COLLABORATOR },
    { title: "Stariji naučni saradnik", value: EmploymentTitle.SENIOR_SCIENTIFIC_COLLABORATOR },
    { title: "Naučni savetnik", value: EmploymentTitle.SCIENTIFIC_ADVISOR },
    { title: "Profesor u penziji", value: EmploymentTitle.RETIRED_PROFESSOR },
    { title: "Profesor inženjer habilitovan", value: EmploymentTitle.PROFESSOR_ENGINEER_HABILITATED },
    { title: "Akademik", value: EmploymentTitle.ACADEMICIAN }
];

export const getEmploymentTitleFromValueAutoLocale = (value: EmploymentTitle) => {
    const locale = i18n.vueI18n.global.locale;
    
    let employmentTitleArray = employmentTitlesEn;
    if (locale == "sr") {
        employmentTitleArray = employmentTitlesSr;
    } else if (locale == "sr-cyr") {
        employmentTitleArray = transliterateContentToCyrillic(employmentTitlesSr);
    }

    return (employmentTitleArray.find(item => item.value === value) || {}).title;
};

export const getEmploymentTitlesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return employmentTitlesSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(employmentTitlesSr);
        case "en":
            return employmentTitlesEn;
    }
};
