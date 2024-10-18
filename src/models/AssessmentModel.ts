import type { AccessLevel, MultilingualContent } from "./Common";
import type { DocumentFile, DocumentFileResponse } from "./DocumentFileModel";


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

export interface AssessmentMeasure {
    id: number;

    formalDescriptionOfRule: string;
    
    code: string;
    
    value: number;
    
    title: MultilingualContent[];
}

export interface AssessmentRulebookResponse {
    id: number;
    name: MultilingualContent[];
    description: MultilingualContent[];
    issueDate: string;
    pdfFile: DocumentFileResponse;
    publisherId: number;
    publisherName: MultilingualContent[];
    assessmentMeasures: AssessmentMeasure
}

export interface AssessmentRulebook {
    name: MultilingualContent[];
    description?: MultilingualContent[];
    issueDate: string;
    pdfFile?: DocumentFile;
    publisherId?: number;
    assessmentMeasureId: number;
}
