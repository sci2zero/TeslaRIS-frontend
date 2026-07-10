import type { ApproveStatus, MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";
import type { ResearchArea } from "./OrganisationUnitModel";

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
    scopusAuthorId: string;
    openAlexId: string;
    webOfScienceResearcherId: string;
    displayBirthdate: boolean;
}

export interface BasicPerson {
    id?: number;
    personName: PersonName;
    contactEmail: string;
    sex?: Sex;
    localBirthDate: string | null;
    phoneNumber: string;
    apvnt?: string | null;
    eCrisId?: string | null;
    eNaukaId?: string | null;
    orcid?: string | null;
    scopusAuthorId?: string | null;
    openAlexId?: string | null;
    webOfScienceResearcherId?: string | null;
    nationalScienceId?: string | null;
    scholarId?: string | null;
    authenticusId?: string | null;
    lattesId?: string | null;
    organisationUnitId?: number;
    employmentPosition?: EmploymentPosition;
    displayTitle: MultilingualContent[];
  }

export interface PersonName {
    id?: number;
    firstname: string;
    otherName: string;
    lastname: string;
    dateFrom?: string | null;
    dateTo?: string | null;
    personNameType?: PersonNameType;
}

export enum PersonNameType {
    PRESENTED_NAME = "PRESENTED_NAME",
    DISPLAY_NAME = "DISPLAY_NAME",
    CITATION_NAME = "CITATION_NAME",
    FULL_NAME = "FULL_NAME"
}
  
export interface PostalAddress {
    countryId?: number;
    streetAndNumber: MultilingualContent[];
    city: MultilingualContent[];
    state: MultilingualContent[];
    postalNumber: string;
}
  
export interface Contact {
    contactEmail?: string;
    phoneNumber: string;
    faxNumber?: string;
    mobilePhoneNumber?: string;
}

export interface PersonContribution {
    id?: number;
    personId: number;
    contributionDescription: MultilingualContent[];
    orderNumber: number;
    institutionIds?: number[];
    displayAffiliationStatement: MultilingualContent[];
    personName?: PersonName;
    postalAddress?: PostalAddress;
    contact?: Contact;
    displayInstitutionNames?: MultilingualContent[][];
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
    TEACHING_ASSOCIATE,
    ASSOCIATE_WITHOUT_TITLE
}

export enum Sex {
    MALE,
    FEMALE,
}

export interface PersonResponse {
    id?: number;
    personName: PersonName;
    personOtherNames: PersonName[];
    personalInfo: PersonalInfo;
    biography: MultilingualContent[];
    keyword: MultilingualContent[];
    approveStatus: ApproveStatus;
    employmentIds: number[];
    educationIds: number[];
    membershipIds: number[];
    expertisesOrSkills: ExpertiseOrSkillResponse[];
    prizes: PrizeResponse[];
    imageServerFilename?: string;
    showFullBirthdate: boolean;
}

export interface PersonalInfo {
    localBirthDate: string;
    placeOfBirth?: string;
    sex: Sex;
    postalAddress?: PostalAddress;
    privatePostalAddress?: PostalAddress;
    contact: Contact;
    privateContact?: Contact;
    apvnt?: string;
    eCrisId?: string;
    eNaukaId?: string;
    orcid?: string;
    scopusAuthorId?: string;
    openAlexId?: string;
    webOfScienceResearcherId?: string;
    nationalScienceId?: string;
    scholarId?: string;
    authenticusId?: string;
    lattesId?: string;
    uris: string[];
    displayTitle: MultilingualContent[];
}

export interface ExpertiseOrSkillResponse {
    id: number;
    name: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    favorite: boolean;
    researchAreasId: number[];
    researchAreas: ResearchArea[];
    proofs: DocumentFileResponse[];
}

export interface ExpertiseOrSkill {
    id?: number;
    name: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    favorite: boolean;
    researchAreasId: number[];
}

export interface PrizeResponse {
    id: number;
    title: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    proofs: DocumentFileResponse[];
    date: string;
    endDate: string;
    prizeType: PrizeType;
    favorite: boolean;
    researchAreasId: number[];
    researchAreas: ResearchArea[];
}

export interface Prize {
    id?: number;
    title: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    date: string;
    endDate: string;
    prizeType: PrizeType;
    favorite: boolean;
    researchAreasId: number[];
}

export enum PrizeType {
    AWARD = "AWARD",
    TITLE = "TITLE",
    OTHER = "OTHER"
}

export interface PrizeIndex {
    id: string;
    titleSr: string;
    titleOther: string;
    titleSrSortable: string;
    titleOtherSortable: string;
    descriptionSr: string;
    descriptionOther: string;
    dateOfAcquisition: string;
    personId: number;
    personName: string;
    databaseId: number;
    relatedInstitutionsIdHierarchy: number[];
    assessedBy: number[];
    commissionAssessments: {a: number, b: string, c: boolean}[];
}

export interface PersonProfileImageRequest {
    file: File
    top: number;
    left: number;
    height: number;
    width: number;
}

export interface PersonFieldVisibility {
    phoneNumberVisible: boolean;
    contactEmailVisible: boolean;
    dateOfBirthVisible: boolean;
    sexVisible: boolean;
    birthplaceVisible: boolean;
    biographyVisible: boolean;
}
