import type { MultilingualContent } from "./Common";
import type { DocumentContributionType, JournalPublicationType, ProceedingsPublicationType } from "./PublicationModel";

interface DocumentLoadDTO {
    title: MultilingualContent[];
    subTitle: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    contributions: PersonDocumentContributionLoad[];
    uris: string[];
    documentDate: string;
    doi: string;
    scopusId: string;
    openAlexId: string;
    webOfScienceId: string;
    eventId: number | null;
}

export interface ProceedingsPublicationLoad extends DocumentLoadDTO {
    proceedingsPublicationType: ProceedingsPublicationType;
    startPage: string;
    endPage: string;
    eIssn: string;
    printIssn: string;
    isbn: string;
    numberOfPages: number | null;
    articleNumber: string;
    proceedingsName: MultilingualContent[];
    conferenceName: MultilingualContent[];
    eventDateFrom: string;
    eventDateTo: string;
    confId: string;
}

export interface JournalPublicationLoad extends DocumentLoadDTO {
    journalPublicationType: JournalPublicationType;
    startPage: string;
    endPage: string;
    numberOfPages: number | null;
    articleNumber: string;
    volume: string;
    issue: string;
    journalEIssn: string;
    journalPrintIssn: string;
    journalOpenAlexId: string;
    journalName: MultilingualContent[];
}

interface PersonDocumentContributionLoad {
    person: PersonLoad;
    contributionDescription: MultilingualContent[];
    institutions: OrganisationUnitLoad[];
    orderNumber: number | null;
    contributionType: DocumentContributionType;
    isMainContributor: boolean | null;
    isCorrespondingContributor: boolean | null;
    key: string;
}

export interface PersonLoad {
    firstName: string;
    middleName: string;
    lastName: string;
    apvnt: string;
    eCrisId: string;
    eNaukaId: string;
    orcid: string;
    scopusAuthorId: string;
    openAlexId: string;
    webOfScienceResearcherId: string;
    importId: string;
}

export interface OrganisationUnitLoad {
    name: MultilingualContent[];
    nameAbbreviation: string;
    scopusAfid: string;
    openAlexId: string;
    importId: string;
}

export interface LoadingConfiguration {
    smartLoadingByDefault: boolean;
    loadedEntitiesAreUnmanaged: boolean;
    priorityLoading: boolean;
}

export interface FormatDescription {
    a: string;
    b: string;
}

export interface AuthorCentricInstitutionHarvestRequest {
    institutionId: number;
    allAuthors: boolean;
    authorIds: number[]
}

export enum RecurrenceType {
    ONCE = "ONCE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    THREE_MONTHLY = "THREE_MONTHLY",
    YEARLY = "YEARLY"
}
