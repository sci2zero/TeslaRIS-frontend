import type { MonetaryAmount, MultilingualContent } from "@/models/Common";
import type { DocumentFileResponse } from "@/models/DocumentFileModel";
import type { ResearchArea } from "@/models/OrganisationUnitModel";
import type { PersonContribution } from "@/models/PersonModel";
import type { FundingType } from "@/models/FundingModel";

export interface FundingCall {
    id?: number;
    name: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    description: MultilingualContent[];
    objectives: MultilingualContent[];
    keywords: MultilingualContent[];
    researchAreasId: number[];
    researchAreas: ResearchArea[];
    uris: string[];
    dateFrom?: string;
    dateTo?: string;
    funderId?: number;
    fundingProgramId?: number;
    fundingProgramName: MultilingualContent[];
    fundingTypes: FundingType[];
    contributors: PersonFundingCallContribution[];
    monetaryAmount?: MonetaryAmount;
    oaMandated?: boolean;
    oaMandateUrl?: string;
    fileItems: DocumentFileResponse[];
}

export interface FundingCallIndex {
    id: string;
    databaseId: number;
    nameSr: string;
    nameOther: string;
    programId?: number;
    funderId?: number;
    dateFrom?: string;
    dateTo?: string;
}

export enum FundingCallContributionType {
    ORGANIZER = "ORGANIZER",
    COORDINATOR = "COORDINATOR",
    ASSESSMENT_BOARD_PRESIDENT = "ASSESSMENT_BOARD_PRESIDENT",
    ASSESSMENT_BOARD_VICEPRESIDENT = "ASSESSMENT_BOARD_VICEPRESIDENT",
    ASSESSMENT_BOARD_MEMBER = "ASSESSMENT_BOARD_MEMBER",
    ASSESSMENT_EVALUATOR = "ASSESSMENT_EVALUATOR",
    ASSESSMENT_SPECIALIST = "ASSESSMENT_SPECIALIST",
    ASSESSMENT_OTHER = "ASSESSMENT_OTHER",
    APPLICANT = "APPLICANT",
    OTHER_CONTRIBUTORS = "OTHER_CONTRIBUTORS",
}

export interface PersonFundingCallContribution extends PersonContribution {
    contributionType: FundingCallContributionType;
}

export interface FundingCallIndex {
    id: string;
    databaseId: number;
    nameSr: string;
    nameSrSortable: string;
    nameOther: string;
    nameOtherSortable: string;
    programId?: number;
    funderId?: number;
    dateFrom?: string;
    dateTo?: string;
}
