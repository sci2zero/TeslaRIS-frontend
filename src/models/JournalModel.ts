import type { PublicationSeries } from "./PublicationSeriesModel";

export interface JournalIndex {
    id: string;
    titleSr: string;
    titleSrSortable: string;
    titleOther: string;
    titleOtherSortable: string;
    eissn: string;
    printISSN: string;
    databaseId: number;
    classifiedBy?: number[];
}

export interface Journal extends PublicationSeries {
    type: ArticleCollectionSeriesType;
}

export enum ArticleCollectionSeriesType {
    JOURNAL = "JOURNAL",
    MAGAZINE = "MAGAZINE",
    NEWSPAPER = "NEWSPAPER",
    NEWSLETTER = "NEWSLETTER"
}
