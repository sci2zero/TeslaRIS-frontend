import type { MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";
import { EmploymentTitle, PersonalTitle } from "./InvolvementModel";
import type { EntityType } from "./MergeModel";
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
    type: PublicationType;
    publicationSeriesId: number | null;
    eventId: number | null;
    publisherId: number | null;
    journalId: number | null;
    monographId: number | null;
    databaseId: number | null;
    doi: string;
    assessedBy?: number[];
    publicationType: string;
}

export enum PublicationType {
    JOURNAL_PUBLICATION = "JOURNAL_PUBLICATION",
    PROCEEDINGS_PUBLICATION = "PROCEEDINGS_PUBLICATION",
    PATENT = "PATENT",
    PROCEEDINGS = "PROCEEDINGS",
    DATASET = "DATASET",
    SOFTWARE = "SOFTWARE",
    MONOGRAPH = "MONOGRAPH",
    MONOGRAPH_PUBLICATION = "MONOGRAPH_PUBLICATION",
    THESIS = "THESIS"
}

export enum ThesisType {
    BACHELOR = "BACHELOR",
    MR = "MR",
    PHD = "PHD",
    PHD_ART_PROJECT = "PHD_ART_PROJECT",
    MASTER = "MASTER",
    BACHELOR_WITH_HONORS = "BACHELOR_WITH_HONORS",
    UNDERGRADUATE_THESIS = "UNDERGRADUATE_THESIS"
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
    openAlexId?: string;
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
    isBoardPresident: boolean;
    employmentTitle?: EmploymentTitle;
    personalTitle?: PersonalTitle;
}

export enum DocumentContributionType {
    AUTHOR = "AUTHOR",
    EDITOR = "EDITOR",
    REVIEWER = "REVIEWER",
    ADVISOR = "ADVISOR",
    BOARD_MEMBER = "BOARD_MEMBER"
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

export enum MonographType {
    RESEARCH_MONOGRAPH = "RESEARCH_MONOGRAPH",
    BOOK = "BOOK",
    BIBLIOGRAPHY = "BIBLIOGRAPHY",
    TRANSLATION = "TRANSLATION",
    STUDY = "STUDY"
}

export interface Monograph extends Document {
    id?: number;
    monographType: MonographType;
    printISBN?: string;
    eisbn?: string;
    numberOfPages?: number;
    volume?: string;
    number?: string;
    publicationSeriesId?: number;
    languageTagIds?: number[];
    researchAreaId?: number;
}

export enum MonographPublicationType {
    CHAPTER = "CHAPTER",
    RESEARCH_ARTICLE = "RESEARCH_ARTICLE",
    PREFACE = "PREFACE",
    LEXICOGRAPHIC_UNIT = "LEXICOGRAPHIC_UNIT",
    POLEMICS = "POLEMICS",
    SCIENTIFIC_CRITIC = "SCIENTIFIC_CRITIC",
}

export interface MonographPublication extends Document {
    monographPublicationType: MonographPublicationType;
    startPage?: string;
    endPage?: string;
    numberOfPages?: number;
    articleNumber?: string;
    monographId?: number;
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

export interface DeduplicationSuggestion {
    id: number;
    leftEntityId: number;
    rightEntityId: number;
    leftTitleSr: string;
    rightTitleSr: string;
    leftTitleOther: string;
    rightTitleOther: string;
    documentPublicationType: PublicationType;
    entityType: EntityType;
}

export interface Thesis extends Document {
    organisationUnitId?: number;
    externalOrganisationUnitName?: MultilingualContent[];
    thesisType: ThesisType;
    numberOfPages?: number;
    numberOfChapters?: number;
    numberOfReferences?: number;
    numberOfGraphs?: number;
    numberOfIllustrations?: number;
    numberOfTables?: number;
    numberOfAppendices?: number;
    languageId?: number;
    writingLanguageTagId?: number;
    scientificArea?: MultilingualContent[];
    scientificSubArea?: MultilingualContent[];
    publisherId?: number;
    languageCode?: string;
    preliminaryFiles?: DocumentFileResponse[];
    preliminarySupplements?: DocumentFileResponse[];
    commissionReports?: DocumentFileResponse[];
    isOnPublicReview?: boolean;
    publicReviewDates?: string[];
    publicReviewEnd?: string;
    isOnPublicReviewPause?: boolean;
    topicAcceptanceDate: string;
    thesisDefenceDate: string;
    isArchived?: boolean;
    eisbn?: string;
    printISBN?: string;
    placeOfKeep?: MultilingualContent[],
    udc?: string;
    typeOfTitle?: MultilingualContent[];
    extendedAbstract?: MultilingualContent[];
    remark?: MultilingualContent[];
    alternateTitle?: MultilingualContent[];
    publicReviewCompleted?: boolean;
}

export interface CitationResponse {
    apa: string;
    mla: string;
    chicago: string;
    harvard: string;
    vancouver: string;
}

export interface DocumentAffiliationRequest {
    documentIds: number[];
    deleteOthers: boolean;
}

export enum MServiceApplicableTypes {
    JOURNAL_PUBLICATION = "JOURNAL_PUBLICATION",
    PROCEEDINGS_PUBLICATION = "PROCEEDINGS_PUBLICATION"
}

export interface ThesisLibraryFormatsResponse {
    etdMs: string;
    dublinCore: string;
    marc21: string;
}

export interface TermFrequency {
    a: string;
    b: number;
}
