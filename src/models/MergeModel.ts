import type { Conference } from "./EventModel";
import type { Journal } from "./JournalModel";
import type { PersonalInfo } from "./PersonModel";
import type { Proceedings } from "./ProceedingsModel";
import type { Dataset, Patent, Software } from "./PublicationModel";


export interface MergedProceedings {
    leftProceedings: Proceedings;
    rightProceedings: Proceedings;
}

export interface MergedPersons {
    leftPerson: PersonalInfo;
    rightPerson: PersonalInfo;
}

export interface MergedConferences {
    leftConference: Conference;
    rightConference: Conference;
}

export interface MergedJournals {
    leftJournal: Journal;
    rightJournal: Journal;
}

export interface MergedSoftware {
    leftSoftware: Software;
    rightSoftware: Software;
}

export interface MergedDatasets {
    leftDataset: Dataset;
    rightDataset: Dataset;
}

export interface MergedPatents {
    leftPatent: Patent;
    rightPatent: Patent;
}

export enum ComparisonSide {
    LEFT = "LEFT",
    RIGHT = "RIGHT"
}
