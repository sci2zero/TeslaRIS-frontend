import type { PublicationSeries } from "./PublicationSeriesModel";

export interface JournalIndex {
    id: string;
    titleSr: string;
    titleSrSortable: string;
    titleOther: string;
    titleOtherSortable: string;
    eISSN: string;
    printISSN: string;
    databaseId: number;
}

export interface Journal extends PublicationSeries {
}
