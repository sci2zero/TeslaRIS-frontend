import type {MonetaryAmount, MultilingualContent} from "@/models/Common";
import type {DocumentFileResponse} from "@/models/DocumentFileModel";

export interface Funding {
    id?: number;
    internalIdentifiers: string[];
    oldIds: string[];
    mergedIds: number[];
    doi?: string;
    grantAgreementId?: string;
    projectId: number;
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
    amount?: MonetaryAmount;
    competitive?: boolean;
    renewable?: boolean;
    dateSubmitted?: string;
    dateAwarded?: string;
    dateFrom?: string;
    dateTo?: string;
    oaMandated?: boolean;
    oaMandateUrl?: string;
}

export enum FundingType {
    GRANT= "GRANT",
    CALL= "CALL",
    OTHER = "OTHER",
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

export interface PrepopulatedFundingMetadata {
    doi: string;
    grantAgreementId: string;
    name: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    description: MultilingualContent[];
    uris: string[];
    dateAwarded: string;
    dateFrom: string;
    dateTo: string;
    monetaryAmount: MonetaryAmount;
    displayFunder: MultilingualContent[];
    funderDoi: string;
}

