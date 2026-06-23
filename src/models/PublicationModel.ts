import type { LanguageTagResponse, MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";
import { EmploymentTitle, PersonalTitle } from "./InvolvementModel";
import type { EntityType } from "./MergeModel";
import { type ResearchArea } from "./OrganisationUnitModel";
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
    presenterIds: number[];
    translatorIds: number[];
    assistantStaffIds: number[];
    arguerIds: number[];
    ownerIds: number[];
    year: number | null;
    type: PublicationType;
    publicationSeriesId: number | null;
    eventId: number | null;
    publisherId: number | null;
    authorReprint?: boolean;
    journalId: number | null;
    monographId: number | null;
    databaseId: number | null;
    doi: string;
    assessedBy?: number[];
    publicationType: string;
    isApproved: boolean;
    areFilesValid: boolean;
    apa: string;
    containsFiles: boolean;
}

export enum PublicationType {
    JOURNAL_PUBLICATION = "JOURNAL_PUBLICATION",
    PROCEEDINGS_PUBLICATION = "PROCEEDINGS_PUBLICATION",
    PATENT = "PATENT",
    PROCEEDINGS = "PROCEEDINGS",
    DATASET = "DATASET",
    INTANGIBLE_PRODUCT = "INTANGIBLE_PRODUCT",
    MONOGRAPH = "MONOGRAPH",
    MONOGRAPH_PUBLICATION = "MONOGRAPH_PUBLICATION",
    THESIS = "THESIS",
    MATERIAL_PRODUCT = "MATERIAL_PRODUCT",
    GENETIC_MATERIAL = "GENETIC_MATERIAL",
    PERFORMANCE_RELATED_OUTPUT = "PERFORMANCE_RELATED_OUTPUT"
}

export enum ThesisType {
    BACHELOR = "BACHELOR",
    MR = "MR",
    PHD = "PHD",
    PHD_ART_PROJECT = "PHD_ART_PROJECT",
    MASTER = "MASTER",
    BACHELOR_WITH_HONORS = "BACHELOR_WITH_HONORS",
    UNDERGRADUATE_THESIS = "UNDERGRADUATE_THESIS",
    OTHER = "OTHER"
}
  
export enum JournalPublicationType {
    REVIEW_ARTICLE = "REVIEW_ARTICLE",
    RESEARCH_ARTICLE = "RESEARCH_ARTICLE",
    PREFACE = "PREFACE",
    COMMENT = "COMMENT",
    CORRECTION = "CORRECTION",
    LEXICOGRAPHIC_UNIT = "LEXICOGRAPHIC_UNIT",
    POLEMICS = "POLEMICS",
    SCIENTIFIC_CRITIC = "SCIENTIFIC_CRITIC",
    EDITORIAL = "EDITORIAL",
    POSTFACE = "POSTFACE",
    BOOK_REVIEW = "BOOK_REVIEW",
    TRANSLATION = "TRANSLATION",
    PREPRINT = "PREPRINT",
    CREATIVE_WORK = "CREATIVE_WORK",
    ANNOTATED_NOTE = "ANNOTATED_NOTE",
    OTHER = "OTHER"
}

export enum PublicationStatus {
    SUBMITTED = "SUBMITTED",
    IN_REVIEW = "IN_REVIEW",
    ACCEPTED = "ACCEPTED",
    IN_PRINT = "IN_PRINT",
    PUBLISHED = "PUBLISHED"
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
    webOfScienceId?: string;
    handleId?: string;
    arxivId?: string;
    pubmedId?: string;
    ssrnId?: string;
    eventId?: number;
    fileItems: DocumentFileResponse[] | undefined;
    proofs: DocumentFileResponse[] | undefined;
    isMetadataValid?: boolean;
    areFilesValid?: boolean;
    isArchived?: boolean;
    remark?: MultilingualContent[];
    peerReviewed?: boolean;
    openAccess?: boolean;
    publicationStatus?: PublicationStatus;
    geoSpaceDescription?: MultilingualContent[];
    chronologicalSpaceDescription?: MultilingualContent[];
    city?: MultilingualContent[];
    edition?: MultilingualContent[];
    authorReprint?: boolean;
    publisherName?: MultilingualContent[];
    eventName?: MultilingualContent[];
}

export interface CommonFieldsData {
    handleId?: string;
    arxivId?: string;
    pubmedId?: string;
    ssrnId?: string;
    city?: MultilingualContent[];
    geoSpaceDescription?: MultilingualContent[];
    chronologicalSpaceDescription?: MultilingualContent[];
    peerReviewed?: boolean;
    openAccess?: boolean;
    publicationStatus?: PublicationStatus;
    edition?: MultilingualContent[];
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
    section?: MultilingualContent[];
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
    ASSOCIATED_EDITOR = "ASSOCIATED_EDITOR",
    INVITED_EDITOR = "INVITED_EDITOR",
    REVIEWER = "REVIEWER",
    ADVISOR = "ADVISOR",
    BOARD_MEMBER = "BOARD_MEMBER",
    PRESENTER = "PRESENTER",
    TRANSLATOR = "TRANSLATOR",
    ASSISTANT_STAFF = "ASSISTANT_STAFF",
    ARGUER = "ARGUER",
    OWNER = "OWNER"
}

export interface ProceedingsPublication extends Document {
    proceedingsPublicationType: ProceedingsPublicationType;
    startPage: string;
    endPage: string;
    numberOfPages: number;
    articleNumber: string;
    proceedingsId: number;
    section?: MultilingualContent[];
}

export enum ProceedingsPublicationType {
    REGULAR_FULL_ARTICLE = "REGULAR_FULL_ARTICLE",
    INVITED_FULL_ARTICLE = "INVITED_FULL_ARTICLE",
    INVITED_ABSTRACT_ARTICLE = "INVITED_ABSTRACT_ARTICLE",
    REGULAR_ABSTRACT_ARTICLE = "REGULAR_ABSTRACT_ARTICLE",
    PREFACE = "PREFACE",
    LEXICOGRAPHIC_UNIT = "LEXICOGRAPHIC_UNIT",
    POLEMICS = "POLEMICS",
    SCIENTIFIC_CRITIC = "SCIENTIFIC_CRITIC",
    POSTFACE = "POSTFACE",
    BOOK_REVIEW = "BOOK_REVIEW"
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
    EDITED_BOOK = "EDITED_BOOK",
    BIBLIOGRAPHY = "BIBLIOGRAPHY",
    TRANSLATION = "TRANSLATION",
    STUDY = "STUDY",
    JOURNAL_ISSUE = "JOURNAL_ISSUE",
    SCRIPT = "SCRIPT",
    ENCYCLOPEDIA = "ENCYCLOPEDIA",
    DICTIONARY = "DICTIONARY",
    REPORT = "REPORT",
    WORKING_PAPER = "WORKING_PAPER",
    PREPRINT = "PREPRINT",
    MANUAL = "MANUAL",
    DATA_MANAGEMENT_PLAN = "DATA_MANAGEMENT_PLAN",
    PROCEEDINGS = "PROCEEDINGS",
    BOOK = "BOOK"
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
    languageIds?: number[];
    researchAreaId?: number;
    publisherId?: number;
    publisherName?: MultilingualContent[];
    udc?: string;
}

export enum MonographPublicationType {
    CHAPTER = "CHAPTER",
    RESEARCH_ARTICLE = "RESEARCH_ARTICLE",
    PREFACE = "PREFACE",
    LEXICOGRAPHIC_UNIT = "LEXICOGRAPHIC_UNIT",
    POLEMICS = "POLEMICS",
    SCIENTIFIC_CRITIC = "SCIENTIFIC_CRITIC",
    POSTFACE = "POSTFACE",
    BOOK_REVIEW = "BOOK_REVIEW",
    ENTRY = "ENTRY"
}

export interface MonographPublication extends Document {
    monographPublicationType: MonographPublicationType;
    startPage?: string;
    endPage?: string;
    numberOfPages?: number;
    articleNumber?: string;
    monographId?: number;
    monographName?: MultilingualContent[];
    section?: MultilingualContent[];
}

export interface Patent extends Document {
    number: string;
    publisherId?: number;
    publisherName?: MultilingualContent[];
}

export interface IntangibleProduct extends Document {
    internalNumber: string;
    publisherId?: number;
    intangibleProductType: IntangibleProductType;
    productUsers: MultilingualContent[];
    researchAreasId: number[];
    researchAreas?: ResearchArea[];
}

export interface MaterialProduct extends Document {
    internalNumber: string;
    publisherId?: number;
    numberProduced: number;
    materialProductType: MaterialProductType;
    productUsers: MultilingualContent[];
    researchAreasId: number[];
    researchAreas?: ResearchArea[];
}

export interface GeneticMaterial extends Document {
    internalNumber: string;
    publisherId?: number;
    geneticMaterialType: GeneticMaterialType
}

export interface Dataset extends Document {
    internalNumber: string;
    publisherId?: number;
}

export interface DeduplicationSuggestion {
    id: string;
    leftEntityId: number;
    rightEntityId: number;
    leftTitleSr: string;
    rightTitleSr: string;
    leftTitleOther: string;
    rightTitleOther: string;
    concreteEntityType: string;
    entityType: EntityType;
    leftYear: number;
    rightYear: number;
    leftAuthors: string;
    rightAuthors: string;
    leftAuthorIds: number[];
    rightAuthorIds: number[];
    leftConcreteType: string;
    rightConcreteType: string;
    publicationType: string;
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
    publicReviewEndDates?: string[];
    publicReviewEnd?: string;
    isOnPublicReviewPause?: boolean;
    topicAcceptanceDate: string;
    thesisDefenceDate: string;
    eisbn?: string;
    printISBN?: string;
    placeOfKeep?: MultilingualContent[],
    udc?: string;
    typeOfTitle?: MultilingualContent[];
    extendedAbstract?: MultilingualContent[];
    alternateTitle?: MultilingualContent[];
    publicReviewCompleted?: boolean;
    isShortenedReview?: boolean;
    substituteFor?: number;
    substitutedTitle?: MultilingualContent[];
    substitutedBy?: number;
    substituteTitle?: MultilingualContent[];
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

export enum MaterialProductType {
    PROTOTYPE = "PROTOTYPE",
    INDUSTRIAL_PRODUCT = "INDUSTRIAL_PRODUCT",
    INFRASTRUCTURE_OBJECT = "INFRASTRUCTURE_OBJECT",
    DERIVATIVE_WORKS = "DERIVATIVE_WORKS",
    OTHER = "OTHER",
    VISUAL_ARTWORK = "VISUAL_ARTWORK"
}

export enum IntangibleProductType {
    SOFTWARE = "SOFTWARE",
    MODEL = "MODEL",
    PROCESS = "PROCESS",
    METHOD = "METHOD",
    STRATEGY = "STRATEGY",
    POLICY = "POLICY",
    FRAMEWORK = "FRAMEWORK",
    OTHER = "OTHER",
    INVENTION = "INVENTION",
    RESEARCH_TECHNIQUE = "RESEARCH_TECHNIQUE",
    ONLINE_RESOURCE = "ONLINE_RESOURCE",
    TEST = "TEST",
    WEBSITE = "WEBSITE",
    AUDIO_RECORDING = "AUDIO_RECORDING",
    RADIO_TV_PROGRAM = "RADIO_TV_PROGRAM",
    VIDEO_RECORDING = "VIDEO_RECORDING",
    SOUND_DESIGN = "SOUND_DESIGN",
    SET_DESIGN = "SET_DESIGN",
    LIGHT_DESIGN = "LIGHT_DESIGN",
    CHOREOGRAPHY = "CHOREOGRAPHY",
    STANDARD = "STANDARD"
}

export enum GeneticMaterialType {
    GENOTYPE = "GENOTYPE",
    RACE = "RACE",
    VARIETY = "VARIETY",
    STRAIN = "STRAIN",
    OTHER = "OTHER"
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

export enum PerformanceRelatedOutputType {
    SLIDES = "SLIDES",
    POSTER = "POSTER",
    CATALOGUE = "CATALOGUE",
    ARTISTIC_EXHIBITION = "ARTISTIC_EXHIBITION",
    MUSICAL_PERFORMANCE = "MUSICAL_PERFORMANCE",
    ART_PERFORMANCE = "ART_PERFORMANCE",
    THEATRIC_PLAY = "THEATRIC_PLAY",
    CURATORIAL_MUSEUM_EXHIBITION = "CURATORIAL_MUSEUM_EXHIBITION",
    LITIGATION = "LITIGATION",
    BROADCAST_INTERVIEW = "BROADCAST_INTERVIEW",
    TEXT_INTERVIEW = "TEXT_INTERVIEW",
    NON_RESEARCH_PRESENTATION = "NON_RESEARCH_PRESENTATION"
}

export interface PerformanceRelatedOutput extends Document {
    type: PerformanceRelatedOutputType;
    producer?: MultilingualContent[];
    distributor?: MultilingualContent[];
    sourceTitle?: MultilingualContent[];
    otherActors?: MultilingualContent[];
    languageTagIds?: number[];
    languageTags?: LanguageTagResponse[];
}
