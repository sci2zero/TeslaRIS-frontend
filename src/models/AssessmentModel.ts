import type { AccessLevel, MultilingualContent } from "./Common";


export interface IndicatorResponse {
    id: number;

    code: string;

    title: MultilingualContent[];

    description: MultilingualContent[]
}

export interface IndicatorRequest {
    code: string;

    title: MultilingualContent[];

    description: MultilingualContent[]

    indicatorAccessLevel: AccessLevel
}

export interface EntityIndicatorResponse {
    numericValue: number,

    booleanValue: boolean,

    textualValue: string,

    fromDate: string,

    toDate: string,

    indicatorResponse: IndicatorResponse
}

export enum StatisticsType {
    VIEW = "VIEW",
    DOWNLOAD = "DOWNLOAD"
}
