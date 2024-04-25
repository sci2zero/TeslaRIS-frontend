import { EmploymentPosition } from "@/models/PersonModel";
import i18n from ".";
import { getNameFromOrdinal } from "@/utils/EnumUtil";

const employmentPositionsEn = [
    { title: "Scientific Advisor", value: EmploymentPosition.SCIENTIFIC_ADVISOR },
    { title: "Assistant Trainee", value: EmploymentPosition.ASSISTANT_TRAINEE },
    { title: "Expert Associate", value: EmploymentPosition.EXPERT_ASSOCIATE },
    { title: "Assistant", value: EmploymentPosition.ASSISTANT },
    { title: "Senior Expert Associate", value: EmploymentPosition.SENIOR_EXPERT_ASSOCIATE },
    { title: "Instructor", value: EmploymentPosition.INSTRUCTOR },
    { title: "Expert Advisor", value: EmploymentPosition.EXPERT_ADVISOR },
    { title: "Collaborator", value: EmploymentPosition.COLLABORATOR },
    { title: "Senior Instructor", value: EmploymentPosition.SENIOR_INSTRUCTOR },
    { title: "Teacher", value: EmploymentPosition.TEACHER },
    { title: "Teacher of Foreign Languages and Skills", value: EmploymentPosition.TEACHER_OF_FOREIGN_LANGUAGES_AND_SKILLS },
    { title: "Researcher", value: EmploymentPosition.RESEARCHER },
    { title: "Professor Engineer Habilitated", value: EmploymentPosition.PROFESSOR_ENGINEER_HABILITATED },
    { title: "Assistant with Master", value: EmploymentPosition.ASSISTANT_WITH_MASTER },
    { title: "Assistant with Magistrate", value: EmploymentPosition.ASSISTANT_WITH_MAGISTRATE },
    { title: "Assistant with Doctorate", value: EmploymentPosition.ASSISTANT_WITH_DOCTORATE },
    { title: "Lecturer", value: EmploymentPosition.LECTURER },
    { title: "Senior Lecturer", value: EmploymentPosition.SENIOR_LECTURER },
    { title: "Professor of Vocational Studies", value: EmploymentPosition.PROFESSOR_OF_VOCATIONAL_STUDIES },
    { title: "Assistant Professor", value: EmploymentPosition.ASSISTANT_PROFESSOR },
    { title: "Associate Professor", value: EmploymentPosition.ASSOCIATE_PROFESSOR },
    { title: "Teaching Assistant", value: EmploymentPosition.TEACHING_ASSISTANT },
    { title: "Full Professor", value: EmploymentPosition.FULL_PROFESSOR },
    { title: "Professor Emeritus", value: EmploymentPosition.PROFESSOR_EMERITUS },
    { title: "Retired Professor", value: EmploymentPosition.RETIRED_PROFESSOR },
    { title: "Research Trainee", value: EmploymentPosition.RESEARCH_TRAINEE },
    { title: "Research Associate", value: EmploymentPosition.RESEARCH_ASSOCIATE },
    { title: "Scientific Collaborator", value: EmploymentPosition.SCIENTIFIC_COLLABORATOR },
    { title: "Senior Scientific Collaborator", value: EmploymentPosition.SENIOR_SCIENTIFIC_COLLABORATOR }
];

const employmentPositionsSr = [
    { title: "Naučni Savetnik", value: EmploymentPosition.SCIENTIFIC_ADVISOR },
    { title: "Asistent Praktikant", value: EmploymentPosition.ASSISTANT_TRAINEE },
    { title: "Ekspert-saradnik", value: EmploymentPosition.EXPERT_ASSOCIATE },
    { title: "Asistent", value: EmploymentPosition.ASSISTANT },
    { title: "Stariji Ekspert-saradnik", value: EmploymentPosition.SENIOR_EXPERT_ASSOCIATE },
    { title: "Instruktor", value: EmploymentPosition.INSTRUCTOR },
    { title: "Ekspert-savetnik", value: EmploymentPosition.EXPERT_ADVISOR },
    { title: "Saradnik", value: EmploymentPosition.COLLABORATOR },
    { title: "Stariji Instruktor", value: EmploymentPosition.SENIOR_INSTRUCTOR },
    { title: "Nastavnik", value: EmploymentPosition.TEACHER },
    { title: "Nastavnik stranih jezika i veština", value: EmploymentPosition.TEACHER_OF_FOREIGN_LANGUAGES_AND_SKILLS },
    { title: "Istraživač", value: EmploymentPosition.RESEARCHER },
    { title: "Profesor inženjer habilitovan", value: EmploymentPosition.PROFESSOR_ENGINEER_HABILITATED },
    { title: "Asistent sa masterom", value: EmploymentPosition.ASSISTANT_WITH_MASTER },
    { title: "Asistent sa magistraturom", value: EmploymentPosition.ASSISTANT_WITH_MAGISTRATE },
    { title: "Asistent sa doktoratom", value: EmploymentPosition.ASSISTANT_WITH_DOCTORATE },
    { title: "Predavač", value: EmploymentPosition.LECTURER },
    { title: "Stariji predavač", value: EmploymentPosition.SENIOR_LECTURER },
    { title: "Profesor strukovnih studija", value: EmploymentPosition.PROFESSOR_OF_VOCATIONAL_STUDIES },
    { title: "Docent", value: EmploymentPosition.ASSISTANT_PROFESSOR },
    { title: "Vanredni profesor", value: EmploymentPosition.ASSOCIATE_PROFESSOR },
    { title: "Asistent u nastavi", value: EmploymentPosition.TEACHING_ASSISTANT },
    { title: "Redovni profesor", value: EmploymentPosition.FULL_PROFESSOR },
    { title: "Profesor emeritus", value: EmploymentPosition.PROFESSOR_EMERITUS },
    { title: "Profesor u penziji", value: EmploymentPosition.RETIRED_PROFESSOR },
    { title: "Istraživač-praktikant", value: EmploymentPosition.RESEARCH_TRAINEE },
    { title: "Istraživač-saradnik", value: EmploymentPosition.RESEARCH_ASSOCIATE },
    { title: "Naučni saradnik", value: EmploymentPosition.SCIENTIFIC_COLLABORATOR },
    { title: "Stariji naučni saradnik", value: EmploymentPosition.SENIOR_SCIENTIFIC_COLLABORATOR },
];

export const getTitleFromValueAutoLocale = (value: EmploymentPosition) => {
    const locale = i18n.vueI18n.global.locale;
    
    let resourceTypeArray = employmentPositionsEn;
    if (locale == "sr") {
        resourceTypeArray = employmentPositionsSr;
    }

    if (typeof value === "number") {
        return (resourceTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (resourceTypeArray.find(item => getNameFromOrdinal(EmploymentPosition, item.value) === value) || {}).title;
    }
};

export const getEmploymentPositionsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return employmentPositionsSr;
        case "en":
            return employmentPositionsEn;
    }
}
