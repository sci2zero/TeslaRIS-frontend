import type { BookSeries } from "./BookSeriesModel";
import type { Conference } from "./EventModel";
import type { Journal } from "./JournalModel";
import type { OrganisationUnitRequest } from "./OrganisationUnitModel";
import type { PersonalInfo } from "./PersonModel";
import type { Proceedings } from "./ProceedingsModel";
import type { Dataset, JournalPublication, Monograph, MonographPublication, Patent, ProceedingsPublication, Software, Thesis } from "./PublicationModel";
import type { Publisher } from "./PublisherModel";


export interface MergedDocuments {

    leftProofs: number[];

    rightProofs: number[];

    leftFileItems: number[];

    rightFileItems: number[];
}

export interface MergedPersons {
    leftPerson: PersonalInfo;
    rightPerson: PersonalInfo;
}

export interface MergedOrganisationUnits {
    leftOrganisationUnit: OrganisationUnitRequest;
    rightOrganisationUnit: OrganisationUnitRequest;
}

export interface MergedConferences {
    leftConference: Conference;
    rightConference: Conference;
}

export interface MergedJournals {
    leftJournal: Journal;
    rightJournal: Journal;
}

export interface MergedBookSeries {
    leftBookSeries: BookSeries;
    rightBookSeries: BookSeries;
}

export interface MergedProceedings extends MergedDocuments {
    leftProceedings: Proceedings;
    rightProceedings: Proceedings;
}

export interface MergedSoftware extends MergedDocuments {
    leftSoftware: Software;
    rightSoftware: Software;
}

export interface MergedDatasets extends MergedDocuments {
    leftDataset: Dataset;
    rightDataset: Dataset;
}

export interface MergedPatents extends MergedDocuments {
    leftPatent: Patent;
    rightPatent: Patent;
}

export interface MergedProceedingsPublications extends MergedDocuments {
    leftProceedingsPublication: ProceedingsPublication;
    rightProceedingsPublication: ProceedingsPublication;
}

export interface MergedTheses extends MergedDocuments {
    leftThesis: Thesis;
    rightThesis: Thesis;
}

export interface MergedJournalPublications extends MergedDocuments {
    leftJournalPublication: JournalPublication;
    rightJournalPublication: JournalPublication;
}

export interface MergedMonographs extends MergedDocuments {
    leftMonograph: Monograph;
    rightMonograph: Monograph;
}

export interface MergedMonographPublications extends MergedDocuments {
    leftMonographPublication: MonographPublication;
    rightMonographPublication: MonographPublication;
}

export interface MergedPublishers {
    leftPublisher: Publisher;
    rightPublisher: Publisher;
}

export enum ComparisonSide {
    LEFT = "LEFT",
    RIGHT = "RIGHT"
}

export enum EntityType {
    PUBLICATION = "PUBLICATION",
    JOURNAL = "JOURNAL",
    EVENT = "EVENT",
    PERSON = "PERSON",
    BOOK_SERIES = "BOOK_SERIES",
    ORGANISATION_UNIT = "ORGANISATION_UNIT",
    PUBLISHER = "PUBLISHER",
    USER_ACCOUNT = "USER_ACCOUNT"
}
