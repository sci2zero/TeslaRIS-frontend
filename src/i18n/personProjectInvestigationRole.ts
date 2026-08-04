import { PersonProjectInvestigationRole } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const personProjectInvestigationRoleSr = [
    { title: "Istraživač", value: PersonProjectInvestigationRole.RESEARCHER },
    { title: "Doktorand", value: PersonProjectInvestigationRole.PHD_STUDENT_FELLOW },
    { title: "Tehnički razvoj", value: PersonProjectInvestigationRole.TECHNICAL_DEVELOPMENT },
    { title: "Master student", value: PersonProjectInvestigationRole.MASTER_STUDENT_FELLOW },
    { title: "Mentor", value: PersonProjectInvestigationRole.SUPERVISOR },
    { title: "Postdoktorand", value: PersonProjectInvestigationRole.POSTDOC },
    { title: "Postdoktorska stipendija", value: PersonProjectInvestigationRole.POSTDOC_FELLOW },
    { title: "Istraživač stipendista", value: PersonProjectInvestigationRole.RESEARCH_FELLOW },
    { title: "Uključivanje u istraživanje - stipendista", value: PersonProjectInvestigationRole.INTEGRATION_INTO_RESEARCH_GRANT_FELLOW },
    { title: "Naučna inicijacija - stipendista", value: PersonProjectInvestigationRole.SCIENTIFIC_INITIATION_FELLOW },
    { title: "Istraživački tehničar - stipendista", value: PersonProjectInvestigationRole.RESEARCH_TECHNICIAN_FELLOW },
    { title: "Gostujući naučnik - stipendista", value: PersonProjectInvestigationRole.INVITED_SCIENTIST_FELLOW },
    { title: "Upravljanje naukom i tehnologijom - stipendista", value: PersonProjectInvestigationRole.SCIENCE_AND_TECHNOLOGY_MANAGEMENT_FELLOW },
    { title: "Naučna ekspedicija", value: PersonProjectInvestigationRole.SCIENTIFIC_EXPEDITION },
    { title: "Ostalo", value: PersonProjectInvestigationRole.OTHER }
];

export const personProjectInvestigationRoleEn = [
    { title: "Researcher", value: PersonProjectInvestigationRole.RESEARCHER },
    { title: "PhD student fellow", value: PersonProjectInvestigationRole.PHD_STUDENT_FELLOW },
    { title: "Technical development", value: PersonProjectInvestigationRole.TECHNICAL_DEVELOPMENT },
    { title: "Master student fellow", value: PersonProjectInvestigationRole.MASTER_STUDENT_FELLOW },
    { title: "Supervisor", value: PersonProjectInvestigationRole.SUPERVISOR },
    { title: "Postdoc", value: PersonProjectInvestigationRole.POSTDOC },
    { title: "Postdoc fellow", value: PersonProjectInvestigationRole.POSTDOC_FELLOW },
    { title: "Research fellow", value: PersonProjectInvestigationRole.RESEARCH_FELLOW },
    { title: "Integration into research grant fellow", value: PersonProjectInvestigationRole.INTEGRATION_INTO_RESEARCH_GRANT_FELLOW },
    { title: "Scientific initiation fellow", value: PersonProjectInvestigationRole.SCIENTIFIC_INITIATION_FELLOW },
    { title: "Research technician fellow", value: PersonProjectInvestigationRole.RESEARCH_TECHNICIAN_FELLOW },
    { title: "Invited scientist fellow", value: PersonProjectInvestigationRole.INVITED_SCIENTIST_FELLOW },
    { title: "Science and technology management fellow", value: PersonProjectInvestigationRole.SCIENCE_AND_TECHNOLOGY_MANAGEMENT_FELLOW },
    { title: "Scientific expedition", value: PersonProjectInvestigationRole.SCIENTIFIC_EXPEDITION },
    { title: "Other", value: PersonProjectInvestigationRole.OTHER }
];

export const getPersonProjectInvestigationRoleTitleFromValueAutoLocale = (value: PersonProjectInvestigationRole) => {
    const locale = i18n.vueI18n.global.locale;

    let personProjectInvestigationRoleArray = personProjectInvestigationRoleEn;
    if (locale == "sr") {
        personProjectInvestigationRoleArray = personProjectInvestigationRoleSr;
    } else if (locale == "sr-cyr") {
        personProjectInvestigationRoleArray = transliterateContentToCyrillic(personProjectInvestigationRoleSr);
    }

    return (personProjectInvestigationRoleArray.find(item => item.value === value) || {}).title;
};

export const getPersonProjectInvestigationRolesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return personProjectInvestigationRoleSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(personProjectInvestigationRoleSr);
        case "en":
            return personProjectInvestigationRoleEn;
    }
};
