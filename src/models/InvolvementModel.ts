import type { MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";

export enum InvolvementType {
    STUDIED_AT = "STUDIED_AT",
    COMPLETED_COURSE_AT = "COMPLETED_COURSE_AT",
    POSTDOC_AT = "POSTDOC_AT",
    MEMBER_OF = "MEMBER_OF",
    EMPLOYED_AT = "EMPLOYED_AT",
    HIRED_BY = "HIRED_BY",
    CANDIDATE = "CANDIDATE"
}

enum EmploymentPosition {
    SCIENTIFIC_ADVISOR,
    ASSISTANT_TRAINEE,
    EXPERT_ASSOCIATE,
    ASSISTANT,
    SENIOR_EXPERT_ASSOCIATE,
    INSTRUCTOR,
    EXPERT_ADVISOR,
    COLLABORATOR,
    SENIOR_INSTRUCTOR,
    TEACHER,
    TEACHER_OF_FOREIGN_LANGUAGES_AND_SKILLS,
    RESEARCHER,
    PROFESSOR_ENGINEER_HABILITATED,
    ASSISTANT_WITH_MASTER,
    ASSISTANT_WITH_MAGISTRATE,
    ASSISTANT_WITH_DOCTORATE,
    LECTURER,
    SENIOR_LECTURER,
    PROFESSOR_OF_VOCATIONAL_STUDIES,
    ASSISTANT_PROFESSOR,
    ASSOCIATE_PROFESSOR,
    TEACHING_ASSISTANT,
    FULL_PROFESSOR,
    PROFESSOR_EMERITUS,
    RETIRED_PROFESSOR,
    RESEARCH_TRAINEE,
    RESEARCH_ASSOCIATE,
    SCIENTIFIC_COLLABORATOR,
    SENIOR_SCIENTIFIC_COLLABORATOR,
}

export interface Involvement {
    id?: number;
    dateFrom: string;
    dateTo?: string;
    proofs?: DocumentFileResponse[];
    involvementType: InvolvementType;
    affiliationStatement?: MultilingualContent[];
    organisationUnitId?: number;
    organisationUnitName?: MultilingualContent[];
}

export interface Education extends Involvement {
    thesisTitle?: MultilingualContent[];
    title?: MultilingualContent[];
    abbreviationTitle?: MultilingualContent[];
}

export interface Membership extends Involvement {
    contributionDescription?: MultilingualContent[];
    role?: MultilingualContent[];
}

export interface Employment extends Involvement {
    employmentPosition?: EmploymentPosition;
    role?: MultilingualContent[];
}

export enum EmploymentTitle {
    FULL_PROFESSOR = "FULL_PROFESSOR",
    ASSISTANT_PROFESSOR = "ASSISTANT_PROFESSOR",
    ASSOCIATE_PROFESSOR = "ASSOCIATE_PROFESSOR",
    PROFESSOR_EMERITUS = "PROFESSOR_EMERITUS",
    SCIENTIFIC_COLLABORATOR = "SCIENTIFIC_COLLABORATOR",
    SENIOR_SCIENTIFIC_COLLABORATOR = "SENIOR_SCIENTIFIC_COLLABORATOR",
    SCIENTIFIC_ADVISOR = "SCIENTIFIC_ADVISOR",
    RETIRED_PROFESSOR = "RETIRED_PROFESSOR",
    PROFESSOR_ENGINEER_HABILITATED = "PROFESSOR_ENGINEER_HABILITATED",
    ACADEMICIAN = "ACADEMICIAN"
}

export enum PersonalTitle {
    DR = "DR",
    ACADEMIC = "ACADEMIC",
    DR_ART = "DR_ART",
    MR = "MR",
    NONE = "NONE"
}
