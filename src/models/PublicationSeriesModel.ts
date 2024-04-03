import type { MultilingualContent } from "./Common";
import type { PersonContribution } from "./PersonModel";

export interface PublicationSeries {
    id?: number;
    title: MultilingualContent[];
    eissn: string;
    printISSN?: string;
    contributions?: PersonPublicationSeriesContribution[];
    languageTagIds: number[];
    nameAbbreviation: MultilingualContent[];
}

interface PersonPublicationSeriesContribution extends PersonContribution {
    contributionType: PublicationSeriesContributionType;
    dateFrom?: string;
    dateTo?: string;
}

enum PublicationSeriesContributionType {
    EDITOR,
    ASSOCIATE_EDITOR,
    REVIEWER,
    SCIENTIFIC_BOARD_MEMBER,
}

export enum PublicationSeriesType {
    JOURNAL,
    BOOK_SERIES
}
