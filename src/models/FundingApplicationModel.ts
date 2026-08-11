import type { MonetaryAmount, MultilingualContent } from "@/models/Common";
import type { FundingPart } from "@/models/FundingModel";
import type { DocumentFileResponse } from "@/models/DocumentFileModel";

export enum FundingApplicationResult {
    AWARDED = "AWARDED",
    REJECTED = "REJECTED",
    CHANGES_REQUESTED = "CHANGES_REQUESTED",
    ACCEPTED_FOR_NEXT_ROUND = "ACCEPTED_FOR_NEXT_ROUND"
}

export interface FundingApplication {
    id?: number;
    projectId?: number;
    fundingCallId?: number;
    revisedFundingApplicationId?: number;
    fundingId?: number;
    otherFundingSources: FundingPart[];
    requestedAmount?: MonetaryAmount;
    description: MultilingualContent[];
    responseSummary: MultilingualContent[];
    submissionDate?: string;
    reviewDateFrom?: string;
    reviewDateTo?: string;
    decisionDate?: string;
    revisedProposalOrNextRoundDeadlineDate?: string;
    result?: FundingApplicationResult;
    documents: DocumentFileResponse[];
    submitterId?: number;
}

export interface FundingApplicationIndex {
    id: string;
    databaseId: number;
    fundingCallId?: number;
    projectId?: number;
    funderId?: number;
    projectNameSr: string;
    projectNameOther: string;
    fundingCallNameSr: string;
    fundingCallNameOther: string;
    funderNameSr: string;
    funderNameOther: string;
    submissionDate?: string;
    decisionDate?: string;
    result?: FundingApplicationResult;
}
