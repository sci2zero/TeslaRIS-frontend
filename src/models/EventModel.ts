import type { MultilingualContent } from "./Common";
import type { PersonContribution } from "./PersonModel";

export enum EventType {
    CONFERENCE = "CONFERENCE",
}

export enum EventContributionType {
    ORGANIZATION_BOARD_CHAIR,
    ORGANIZATION_BOARD_MEMBER,
    REVIEWER,
    PROGRAMME_BOARD_MEMBER,
    SPEAKER,
    PANELISTS,
    CHAIR,
    AUDIENCE,
    DEMONSTRATOR
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
  
export interface PersonEventContribution extends PersonContribution {
    eventContributionType: EventContributionType;
}
  
interface Event {
    id?: number;
    name: MultilingualContent[];
    nameAbbreviation: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    serialEvent: boolean;
    dateFrom: string;
    dateTo: string;
    state: MultilingualContent[];
    place: MultilingualContent[];
    contributions?: PersonEventContribution[];
}

export interface Conference extends Event {
    number?: string;
    fee?: string;
    confId?: string;
}
