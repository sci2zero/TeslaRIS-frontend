import type { MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";
import type { PersonContribution } from "./PersonModel";

export interface DocumentPublicationIndex {
    id: string;
    titleSr: string;
    titleSrSortable: string;
    titleOther: string;
    titleOtherSortable: string;
    descriptionSr: string;
    descriptionOther: string;
    keywordsSr: string;
    keywordsOther: string;
    fullTextSr: string;
    fullTextOther: string;
    authorIds: number[];
    authorNames: string;
    authorNamesSortable: string;
    editorIds: number[];
    editorNames: string;
    reviewerIds: number[];
    reviewerNames: string;
    advisorIds: number[];
    advisorNames: string;
    year: number | null;
    type: string;
    publicationSeriesId: number | null;
    eventId: number | null;
    publisherId: number | null;
    journalId: number | null;
    databaseId: number | null;
    doi: string;
}
  
export enum JournalPublicationType {
    REVIEW_ARTICLE,
    RESEARCH_ARTICLE,
    PREFACE,
    COMMENT,
    CORRECTION,
    LEXICOGRAPHIC_UNIT,
    POLEMICS,
    SCIENTIFIC_CRITIC,
}

export interface Document {
    id?: number;
    title: MultilingualContent[];
    subTitle: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    contributions?: PersonDocumentContribution[];
    uris: string[];
    documentDate?: string;
    doi?: string;
    scopusId?: string;
    eventId?: number;
    fileItems: DocumentFileResponse[] | undefined;
    proofs: DocumentFileResponse[] | undefined;
}

export interface JournalPublication extends Document {
    journalPublicationType: JournalPublicationType;
    startPage: string;
    endPage: string;
    numberOfPages: number;
    articleNumber: string;
    volume: string;
    issue: string;
    journalId: number;
  }

export interface PersonDocumentContribution extends PersonContribution {
    contributionType: DocumentContributionType;
    isMainContributor: boolean;
    isCorrespondingContributor: boolean;
}

export enum DocumentContributionType {
    AUTHOR,
    EDITOR,
    REVIEWER,
    ADVISOR,
}

export interface ProceedingsPublication extends Document {
    proceedingsPublicationType: ProceedingsPublicationType;
    startPage: string;
    endPage: string;
    numberOfPages: number;
    articleNumber: string;
    proceedingsId: number;
}

export enum ProceedingsPublicationType {
    REGULAR_FULL_ARTICLE,
    INVITED_FULL_ARTICLE,
    INVITED_ABSTRACT_ARTICLE,
    REGULAR_ABSTRACT_ARTICLE,
    PREFACE,
    LEXICOGRAPHIC_UNIT,
    POLEMICS,
    SCIENTIFIC_CRITIC,
}

export interface ProceedingsPublicationResponse {
    id: number,
    proceedingsTitle: MultilingualContent[];
    title: MultilingualContent[];
    documentDate: string;
}

export interface ProceedingsPublication extends Document {
    proceedingsPublicationType: ProceedingsPublicationType;
    startPage: string;
    endPage: string;
    numberOfPages: number;
    articleNumber: string;
    proceedingsId: number;
}

export interface Patent extends Document {
    number: string;
    publisherId?: number;
}

export interface Software extends Document {
    internalNumber: string;
    publisherId?: number;
}

export interface Dataset extends Document {
    internalNumber: string;
    publisherId?: number;
}
