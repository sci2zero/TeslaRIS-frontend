import type { MultilingualContent } from "./Common";

export interface PublisherIndex {
    id: string;
    nameSr: string;
    nameSrSortable: string;
    nameOther: string;
    nameOtherSortable: string;
    placeSr: string;
    placeSrSortable: string;
    placeOther: string;
    placeOtherSortable: string;
    stateSr: string;
    stateSrSortable: string;
    stateOther: string;
    stateOtherSortable: string;
    databaseId: number;
}

export interface Publisher {
    id?: number;
    name: MultilingualContent[];
    state: MultilingualContent[];
    place: MultilingualContent[];
}