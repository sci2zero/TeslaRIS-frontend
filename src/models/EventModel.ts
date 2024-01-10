export enum EventType {
    CONFERENCE = "CONFERENCE",
}

export interface EventIndex {
    id: string;
    nameSr: string;
    nameSrSortable: string;
    nameOther: string;
    nameOtherSortable: string;
    descriptionSr: string;
    descriptionOther: string;
    keywordsSr: string;
    keywordsOther: string;
    stateSr: string;
    stateSrSortable: string;
    stateOther: string;
    stateOtherSortable: string;
    placeSr: string;
    placeOther: string;
    dateFromTo: string;
    dateSortable: string;
    databaseId: number;
    eventType: EventType;
}