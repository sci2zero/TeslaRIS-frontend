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
