import type { PublicationSeries } from "./PublicationSeriesModel";

export interface BookSeriesIndex {
    id: string;
    titleSr: string;
    titleSrSortable: string;
    titleOther: string;
    titleOtherSortable: string;
    eissn: string;
    printISSN: string;
    databaseId: number;
}

export interface BookSeries extends PublicationSeries {
}
