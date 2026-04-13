import type { MultilingualContent } from "./Common";
import type { PersonContribution } from "./PersonModel";

export enum EventType {
    CONFERENCE = "CONFERENCE",
    EXHIBITION = "EXHIBITION",
    COURSE = "COURSE",
    OTHER_EVENT = "OTHER_EVENT"
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
    serialEvent: boolean;
    classifiedBy?: number[];
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
    place: MultilingualContent[];
    contributions?: PersonEventContribution[];
    countryId?: number;
    uris: string[];
    displayOrganizer: MultilingualContent[];
}

export interface Conference extends Event {
    number?: string;
    fee?: string;
    confId?: string;
    openAlexId?: string;
}

export interface Exhibition extends Event {
    number?: string;
    fee?: string;
}

export interface Course extends Event {
    courseLevel?: string;
    courseCode?: string;
    numberOfCredits?: string;
    academicYear?: string;
    groupName?: MultilingualContent[];
    numberOfStudents?: number;
}

export enum OtherEventType {
    WEBINAR = "WEBINAR",
    LECTURE = "LECTURE",
    PERFORMANCE = "PERFORMANCE",
    PLAY = "PLAY",
    CEREMONY = "CEREMONY",
    TRIAL = "TRIAL",
    THESIS_DEFENCE = "THESIS_DEFENCE"
}

export interface OtherEvent extends Event {
    type?: OtherEventType;
}

export interface EventsRelation {
    id?: number;
    sourceId: number;
    targetId: number;
    eventsRelationType: EventsRelationType;
    sourceEventName?: MultilingualContent[];
    targetEventName?: MultilingualContent[];
}

export enum EventsRelationType {
    PART_OF = "PART_OF",
    HAS_PART = "HAS_PART",
    BELONGS_TO_SERIES = "BELONGS_TO_SERIES",
    COLLOCATED_WITH = "COLLOCATED_WITH",
}
