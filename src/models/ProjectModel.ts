import type { MonetaryAmount, MultilingualContent } from "@/models/Common";
import type { PersonContribution } from "@/models/PersonModel";
import type { FundingPart } from "@/models/FundingModel";

export interface Project {
    id?: number;
    internalIdentifiers: string[];
    oldIds: string[];
    mergedIds: string[];
    doi?: string;
    raid?: string;
    name: MultilingualContent[];
    description: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    keywords: MultilingualContent[];
    researchAreasId: number[];
    uris: string[];
    dateFrom?: string;
    dateTo?: string;
    status: ProjectStatus;
    collaborationType: ProjectCollaborationType;
    researchType: ProjectResearchType;
    notFunded?: boolean;
    costs?: MonetaryAmount;
    persons: PersonProjectContribution[];
    consortium: OrganisationUnitProjectContribution[];
}

export interface PrepopulatedProjectMetadata {
    doi: string;
    name: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    uris: string[];
    dateFrom: string;
    dateTo: string;
    costs?: MonetaryAmount;
    status: ProjectStatus;
}

export interface ProjectIndex {
    id: string;
    databaseId: number;
    nameSr: string;
    nameSrSortable: string;
    nameOther: string;
    nameOtherSortable: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface PersonProjectContribution extends PersonContribution {
    contributionType: PersonProjectContributionType;
    investigationRole: PersonProjectInvestigationRole;
    otherRoleDescription: MultilingualContent[];
    fundingParts: FundingPart[];
}

export interface OrganisationUnitProjectContribution {
    id?: number;
    organisationUnitId?: number;
    organisationUnitName?: MultilingualContent[];
    displayOrganisationUnit: MultilingualContent[];
    contributionDescription: MultilingualContent[];
    contributionType: OrganisationUnitProjectContributionType;
    orderNumber: number;
    dateFrom?: string;
    dateTo?: string;
    uris?: string[];
    isMainContributor?: boolean;
    fundingParts?: FundingPart[];
}

export interface ProjectDocument {
    id?: number;
    projectId: number;
    documentId?: number;
    documentTitleSr?: string;
    documentTitleOther?: string;
    documentType?: string;
    textualDescription: MultilingualContent[];
    relationType: ProjectDocumentType;
    fundingParts?: FundingPart[];
}

export enum ProjectDocumentType {
    REPORT = "REPORT",
    RESULT = "RESULT",
    USED = "USED",
    INTERNAL = "INTERNAL"
}

export interface ProjectEvent {
    id?: number;
    projectId: number;
    eventId?: number;
    eventNameSr?: string;
    eventNameOther?: string;
    eventType?: string;
    textualDescription: MultilingualContent[];
    relationType: ProjectEventType;
    fundingParts?: FundingPart[];
}

export enum ProjectEventType {
    MEETING = "MEETING",
    PROJECT_RESULTS_PRESENTED_AT = "PROJECT_RESULTS_PRESENTED_AT",
    PUBLIC_EVENT_ORGANIZED_BY_PROJECT = "PUBLIC_EVENT_ORGANIZED_BY_PROJECT"
}

export enum ProjectStatus {
    SUBMITTED = "SUBMITTED",
    UNDER_EVALUATION = "UNDER_EVALUATION",
    ONGOING = "ONGOING",
    CANCELLED = "CANCELLED",
    CONCLUDED = "CONCLUDED"
}

export enum ProjectCollaborationType {
    INTERNAL = "INTERNAL",
    INTERNATIONAL_BILATERAL = "INTERNATIONAL_BILATERAL",
    INTERNATIONAL_MULTILATERAL = "INTERNATIONAL_MULTILATERAL",
    NATIONAL = "NATIONAL"
}

export enum ProjectResearchType {
    FUNDAMENTAL = "FUNDAMENTAL",
    INNOVATION = "INNOVATION",
    DEVELOPMENT = "DEVELOPMENT",
    STRATEGIC = "STRATEGIC",
    NETWORKING = "NETWORKING",
    CAPACITY_BUILDING = "CAPACITY_BUILDING",
    MOBILITY = "MOBILITY",
    INFRASTRUCTURE = "INFRASTRUCTURE",
    OTHER = "OTHER"
}

export enum PersonProjectContributionType {
    PRINCIPLE_INVESTIGATOR = "PRINCIPLE_INVESTIGATOR",
    TEAM_MEMBER = "TEAM_MEMBER",
    CONTACT = "CONTACT",
    INKIND_CONTRIBUTOR = "INKIND_CONTRIBUTOR",
    CONTRACTOR = "CONTRACTOR",
    PARTICIPATION = "PARTICIPATION"
}

export enum OrganisationUnitProjectContributionType {
    COORDINATOR = "COORDINATOR",
    PARTNER = "PARTNER",
    CONSORTIUM_MEMBER = "CONSORTIUM_MEMBER",
    INKIND_CONTRIBUTOR = "INKIND_CONTRIBUTOR",
    CONTRACTOR = "CONTRACTOR",
    BENEFICIARY = "BENEFICIARY"
}

export enum PersonProjectInvestigationRole {
    RESEARCHER = "RESEARCHER",
    PHD_STUDENT_FELLOW = "PHD_STUDENT_FELLOW",
    TECHNICAL_DEVELOPMENT = "TECHNICAL_DEVELOPMENT",
    MASTER_STUDENT_FELLOW = "MASTER_STUDENT_FELLOW",
    SUPERVISOR = "SUPERVISOR",
    POSTDOC = "POSTDOC",
    POSTDOC_FELLOW = "POSTDOC_FELLOW",
    RESEARCH_FELLOW = "RESEARCH_FELLOW",
    INTEGRATION_INTO_RESEARCH_GRANT_FELLOW = "INTEGRATION_INTO_RESEARCH_GRANT_FELLOW",
    SCIENTIFIC_INITIATION_FELLOW = "SCIENTIFIC_INITIATION_FELLOW",
    RESEARCH_TECHNICIAN_FELLOW = "RESEARCH_TECHNICIAN_FELLOW",
    INVITED_SCIENTIST_FELLOW = "INVITED_SCIENTIST_FELLOW",
    SCIENCE_AND_TECHNOLOGY_MANAGEMENT_FELLOW = "SCIENCE_AND_TECHNOLOGY_MANAGEMENT_FELLOW",
    SCIENTIFIC_EXPEDITION = "SCIENTIFIC_EXPEDITION",
    OTHER = "OTHER"
}
