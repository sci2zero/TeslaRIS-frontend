import type {MonetaryAmount, MultilingualContent} from "@/models/Common";
import type {DocumentFileResponse} from "@/models/DocumentFileModel";
import type {ResearchArea} from "@/models/OrganisationUnitModel";

export interface Funding {
    id?: number;
    internalIdentifiers: string[];
    oldIds: string[];
    mergedIds: number[];
    doi?: string;
    grantAgreementId?: string;
    projectId?: number;
    agreements: DocumentFileResponse[];
    fundingParts: FundingPart[];
    name: MultilingualContent[];
    description: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    keywords: MultilingualContent[];
    researchAreasId: number[];
    uris: string[];
    fundingCallId?: number;
    funderId?: number;
    displayCall: MultilingualContent[];
    displayProgram: MultilingualContent[];
    displayFunder: MultilingualContent[];
    fundingTypes: FundingType[];
    fundingLocationType?: FundingLocationType;
    amount?: MonetaryAmount;
    competitive?: boolean;
    renewable?: boolean;
    dateSubmitted?: string;
    dateAwarded?: string;
    dateFrom?: string;
    dateTo?: string;
    oaMandated?: boolean;
    oaMandateUrl?: string;
    internalInvestment?: boolean;
}

export interface FundingIndex {
    id: string;
    databaseId: number;
    nameSr: string;
    nameOther: string;
    funderNameSr: string;
    funderNameOther: string;
    funderId?: number;
    projectId?: number;
    fundingCallId?: number;
    dateFrom?: string;
    dateTo?: string;
}

export interface FundingProgramIndex {
    id: string;
    databaseId: number;
    nameSr: string;
    nameSrSortable: string;
    nameOther: string;
    nameOtherSortable: string;
    funderNameSr: string;
    funderNameOther: string;
    funderId?: number;
    dateFrom?: string;
    dateTo?: string;
    totalAmount: number;
    currencySymbol: string;
}

export enum FundingType {
    GRANT= "GRANT",
    CALL= "CALL",
    FUNDING_PROGRAM = "FUNDING_PROGRAM",
    CONTRACT = "CONTRACT",
    GIFT = "GIFT",
    TENDER = "TENDER",
    INTERNAL_FUNDING = "INTERNAL_FUNDING",
    AWARD = "AWARD",
    PROJECT = "PROJECT",
    EMPLOYMENT = "EMPLOYMENT",
    INSTITUTIONAL_FUNDING = "INSTITUTIONAL_FUNDING",
    RESOURCE_ALLOCATION = "RESOURCE_ALLOCATION",
    OTHER = "OTHER",
}

export enum FundingLocationType {
    NATIONAL = "NATIONAL",
    ABROAD = "ABROAD",
    MIXED = "MIXED",
}

export interface FundingPart {
    id?: number;
    fundingId: number;
    description: MultilingualContent[];
    amount: MonetaryAmount;
    projectEventId?: number;
    projectDocumentId?: number;
    fundingApplicationId?: number;
    personProjectContributionId?: number;
    organisationUnitProjectContributionId?: number;
}

export interface FundingProgram {
    id?: number;
    name: MultilingualContent[];
    description: MultilingualContent[];
    objectives: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    keywords: MultilingualContent[];
    researchAreasId: number[];
    funderId: number;
    fundingTypes: FundingType[];
    totalAmount?: MonetaryAmount;
    dateFrom?: string;
    dateTo?: string;
    uris: string[];
    oaMandated?: boolean;
    oaMandateUrl?: string;
    fileItems: DocumentFileResponse[];
    researchAreas: ResearchArea[];
    funderName: MultilingualContent[];
}

export interface PrepopulatedFundingMetadata {
    doi: string;
    grantAgreementId: string;
    name: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    uris: string[];
    dateAwarded: string;
    dateFrom: string;
    dateTo: string;
    monetaryAmount: MonetaryAmount;
    displayCall: MultilingualContent[];
    displayProgram: MultilingualContent[];
    displayFunder: MultilingualContent[];
    funderDoi: string;
}

