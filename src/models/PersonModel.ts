import type { MultilingualContent } from "./Common";

export interface PersonIndex {
    id: string;
    name: string;
    nameSortable: string;
    employmentsSr: string;
    employmentsSrSortable: string;
    employmentsOther: string;
    employmentsOtherSortable: string;
    employmentInstitutionsId: number[];
    birthdate: string;
    birthdateSortable: string;
    databaseId: number;
    orcid: string;
}

export interface BasicPerson {
    id?: number;
    personName: PersonName;
    contactEmail: string;
    sex?: Sex;
    localBirthDate: string | null;
    phoneNumber: string;
    apvnt?: string | null;
    mnid?: string | null;
    orcid?: string | null;
    scopusAuthorId?: string | null;
    organisationUnitId: number;
    employmentPosition: EmploymentPosition;
  }

interface PersonName {
    firstname: string;
    otherName: string;
    lastname: string;
    dateFrom?: string | null;
    dateTo?: string | null;
}
  
interface PostalAddress {
    countryId: number;
    streetAndNumber: MultilingualContent[];
    city: MultilingualContent[];
}
  
interface Contact {
    contactEmail?: string;
    phoneNumber: string;
}

export interface PersonContribution {
    personId?: number;
    contributionDescription: MultilingualContent[];
    orderNumber: number;
    institutionIds: number[];
    displayAffiliationStatement: MultilingualContent[];
    personName: PersonName;
    postalAddress: PostalAddress;
    contact: Contact;
}

export enum EmploymentPosition {
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

export enum Sex {
    MALE,
    FEMALE,
}
