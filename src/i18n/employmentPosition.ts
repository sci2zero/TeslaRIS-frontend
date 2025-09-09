import { EmploymentPosition } from "@/models/PersonModel";
import i18n from ".";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

const employmentPositionsEn = [
    { title: "Associate without academic title", value: EmploymentPosition.ASSOCIATE_WITHOUT_TITLE },
    { title: "Collaborator", value: EmploymentPosition.COLLABORATOR },
    { title: "Assistant Trainee", value: EmploymentPosition.ASSISTANT_TRAINEE },
    { title: "Teaching Associate", value: EmploymentPosition.TEACHING_ASSOCIATE },
    { title: "Teaching Assistant", value: EmploymentPosition.TEACHING_ASSISTANT },
    { title: "Assistant with magistrate", value: EmploymentPosition.ASSISTANT_WITH_MAGISTRATE },
    { title: "Assistant with PhD", value: EmploymentPosition.ASSISTANT_WITH_DOCTORATE },
    { title: "Assistant Professor", value: EmploymentPosition.ASSISTANT_PROFESSOR },
    { title: "Associate Professor", value: EmploymentPosition.ASSOCIATE_PROFESSOR },
    { title: "Full Professor", value: EmploymentPosition.FULL_PROFESSOR },
    { title: "Professor Emeritus", value: EmploymentPosition.PROFESSOR_EMERITUS },
    { title: "Retired Professor", value: EmploymentPosition.RETIRED_PROFESSOR },
    { title: "Lecturer", value: EmploymentPosition.LECTURER },
    { title: "Senior Lecturer", value: EmploymentPosition.SENIOR_LECTURER },
    { title: "Teacher of Foreign Languages and Skills", value: EmploymentPosition.TEACHER_OF_FOREIGN_LANGUAGES_AND_SKILLS },
    { title: "Professor of Vocational Studies", value: EmploymentPosition.PROFESSOR_OF_VOCATIONAL_STUDIES },
    { title: "Research Trainee", value: EmploymentPosition.RESEARCH_TRAINEE },
    { title: "Research Associate", value: EmploymentPosition.RESEARCH_ASSOCIATE },
    { title: "Scientific Collaborator", value: EmploymentPosition.SCIENTIFIC_COLLABORATOR },
    { title: "Senior Scientific Collaborator", value: EmploymentPosition.SENIOR_SCIENTIFIC_COLLABORATOR },
    { title: "Scientific Advisor", value: EmploymentPosition.SCIENTIFIC_ADVISOR },
    { title: "Expert Associate", value: EmploymentPosition.EXPERT_ASSOCIATE },
    { title: "Senior Expert Associate", value: EmploymentPosition.SENIOR_EXPERT_ASSOCIATE },
    { title: "Expert Advisor", value: EmploymentPosition.EXPERT_ADVISOR }

    // { title: "Assistant", value: EmploymentPosition.ASSISTANT },
    // { title: "Instructor", value: EmploymentPosition.INSTRUCTOR },
    // { title: "Senior Instructor", value: EmploymentPosition.SENIOR_INSTRUCTOR },
    // { title: "Teacher", value: EmploymentPosition.TEACHER },
    // { title: "Researcher", value: EmploymentPosition.RESEARCHER },
    // { title: "Professor Engineer Habilitated", value: EmploymentPosition.PROFESSOR_ENGINEER_HABILITATED },
    // { title: "Assistant with Master", value: EmploymentPosition.ASSISTANT_WITH_MASTER },
];

const employmentPositionsSr = [
    { title: "Saradnik bez saradničkog zvanja", value: EmploymentPosition.ASSOCIATE_WITHOUT_TITLE },
    { title: "Saradnik", value: EmploymentPosition.COLLABORATOR },
    { title: "Saradnik Praktikant", value: EmploymentPosition.ASSISTANT_TRAINEE },
    { title: "Saradnik u nastavi", value: EmploymentPosition.TEACHING_ASSOCIATE },
    { title: "Asistent", value: EmploymentPosition.TEACHING_ASSISTANT },
    { title: "Asistent sa magistraturom", value: EmploymentPosition.ASSISTANT_WITH_MAGISTRATE },
    { title: "Asistent sa doktoratom", value: EmploymentPosition.ASSISTANT_WITH_DOCTORATE },
    { title: "Docent", value: EmploymentPosition.ASSISTANT_PROFESSOR },
    { title: "Vanredni profesor", value: EmploymentPosition.ASSOCIATE_PROFESSOR },
    { title: "Redovni profesor", value: EmploymentPosition.FULL_PROFESSOR },
    { title: "Profesor emeritus", value: EmploymentPosition.PROFESSOR_EMERITUS },
    { title: "Profesor u penziji", value: EmploymentPosition.RETIRED_PROFESSOR },
    { title: "Predavač", value: EmploymentPosition.LECTURER },
    { title: "Stariji predavač", value: EmploymentPosition.SENIOR_LECTURER },
    { title: "Nastavnik stranih jezika i veština", value: EmploymentPosition.TEACHER_OF_FOREIGN_LANGUAGES_AND_SKILLS },
    { title: "Profesor strukovnih studija", value: EmploymentPosition.PROFESSOR_OF_VOCATIONAL_STUDIES },
    { title: "Istraživač pripravnik", value: EmploymentPosition.RESEARCH_TRAINEE },
    { title: "Istraživač saradnik", value: EmploymentPosition.RESEARCH_ASSOCIATE },
    { title: "Naučni saradnik", value: EmploymentPosition.SCIENTIFIC_COLLABORATOR },
    { title: "Viši naučni saradnik", value: EmploymentPosition.SENIOR_SCIENTIFIC_COLLABORATOR },
    { title: "Naučni Savetnik", value: EmploymentPosition.SCIENTIFIC_ADVISOR },
    { title: "Stručni saradnik", value: EmploymentPosition.EXPERT_ASSOCIATE },
    { title: "Viši stručni saradnik", value: EmploymentPosition.SENIOR_EXPERT_ASSOCIATE },
    { title: "Stručni savetnik", value: EmploymentPosition.EXPERT_ADVISOR },
    
    // { title: "Asistent", value: EmploymentPosition.ASSISTANT },
    // { title: "Instruktor", value: EmploymentPosition.INSTRUCTOR },
    // { title: "Stariji Instruktor", value: EmploymentPosition.SENIOR_INSTRUCTOR },
    // { title: "Nastavnik", value: EmploymentPosition.TEACHER },
    // { title: "Istraživač", value: EmploymentPosition.RESEARCHER },
    // { title: "Profesor inženjer habilitovan", value: EmploymentPosition.PROFESSOR_ENGINEER_HABILITATED },
    // { title: "Asistent sa masterom", value: EmploymentPosition.ASSISTANT_WITH_MASTER },
];

export const getEmploymentPositionTitleFromValueAutoLocale = (value: EmploymentPosition) => {
    const locale = i18n.vueI18n.global.locale;
    
    let employmentPositionArray = employmentPositionsEn;
    if (locale == "sr") {
        employmentPositionArray = employmentPositionsSr;
    } else if (locale == "sr-cyr") {
        employmentPositionArray = transliterateContentToCyrillic(employmentPositionsSr);
    }

    if (typeof value === "number") {
        return (employmentPositionArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (employmentPositionArray.find(item => getNameFromOrdinal(EmploymentPosition, item.value) === value) || {}).title;
    }
};

export const getEmploymentPositionsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return employmentPositionsSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(employmentPositionsSr);
        case "en":
            return employmentPositionsEn;
    }
}
