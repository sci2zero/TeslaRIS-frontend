import { type MultilingualContent } from "./Common";
import { ThesisType } from "./PublicationModel"


export interface ThesisReportRequest {
    fromDate: string,
    toDate: string;
    topLevelInstitutionIds: number[];
    thesisType: ThesisType;
}

export interface ThesisReportCounts {
    institutionId: number;
    institutionName: MultilingualContent[];
    defendedCount: number;
    putOnPublicReviewCount: number;
    topicsAcceptedCount: number;
    publiclyAvailableCount: number;
}

export enum ThesisReportType {
    DEFENDED = "DEFENDED",
    ACCEPTED = "ACCEPTED",
    PUBLIC_REVIEW = "PUBLIC_REVIEW",
    PUBLICLY_AVAILABLE = "PUBLICLY_AVAILABLE"
}
