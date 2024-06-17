import type { MultilingualContent } from "./Common";
import type { DocumentContributionType, JournalPublicationType, ProceedingsPublicationType } from "./PublicationModel";

interface DocumentLoadDTO {
    title: MultilingualContent[];
    subTitle: MultilingualContent[];
    description: MultilingualContent[];
    keywords: MultilingualContent[];
    contributions: PersonDocumentContributionLoad[];
    uris: Set<string>;
    documentDate: string;
    doi: string;
    scopusId: string;
    eventId: number | null;
}

export interface ProceedingsPublicationLoad extends DocumentLoadDTO {
    proceedingsPublicationType: ProceedingsPublicationType;
    startPage: string;
    endPage: string;
    numberOfPages: number | null;
    articleNumber: string;
    proceedingsName: MultilingualContent[];
}

export interface JournalPublicationLoad extends DocumentLoadDTO {
    journalPublicationType: JournalPublicationType;
    startPage: string;
    endPage: string;
    numberOfPages: number | null;
    articleNumber: string;
    volume: string;
    issue: string;
    journalId: number | null;
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
}

export interface PersonLoad {
    firstName: string;
    middleName: string;
    lastName: string;
    apvnt: string;
    mnid: string;
    orcid: string;
    scopusAuthorId: string;
}

interface OrganisationUnitLoad {
    name: MultilingualContent[];
    nameAbbreviation: string;
    scopusAfid: string;
}
