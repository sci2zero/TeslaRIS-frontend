import type { MultilingualContent } from "./Common";
import type { PersonContribution } from "./PersonModel";

export interface PublicationSeries {
    id?: number;
    title: MultilingualContent[];
    eissn: string;
    printISSN?: string;
    openAlexId?: string;
    contributions?: PersonPublicationSeriesContribution[];
    languageIds: number[];
    nameAbbreviation: MultilingualContent[];
    uris: string[],
    subtitle?: MultilingualContent[];
}

export interface PersonPublicationSeriesContribution extends PersonContribution {
    contributionType: PublicationSeriesContributionType;
    isMainContributor?: boolean;
    dateFrom?: string;
    dateTo?: string;
}

export enum PublicationSeriesContributionType {
    EDITOR = "EDITOR",
    ASSOCIATE_EDITOR = "ASSOCIATE_EDITOR",
    REVIEWER = "REVIEWER",
    SCIENTIFIC_BOARD_MEMBER = "SCIENTIFIC_BOARD_MEMBER",
    INVITED_EDITOR = "INVITED_EDITOR",
    ADHOC_REVIEWER = "ADHOC_REVIEWER"
}

export enum PublicationSeriesType {
    JOURNAL,
    BOOK_SERIES
}
