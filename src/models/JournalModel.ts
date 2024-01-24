import type { MultilingualContent } from "./Common";
import type { PersonContribution } from "./PersonModel";

export interface JournalIndex {
    id: string;
    titleSr: string;
    titleSrSortable: string;
    titleOther: string;
    titleOtherSortable: string;
    eISSN: string;
    printISSN: string;
    databaseId: number;
}

export interface Journal {
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
