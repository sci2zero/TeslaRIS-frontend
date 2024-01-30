import type { Document } from "./PublicationModel";

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

export interface Proceedings extends Document {
    eISBN?: string;
    printISBN?: string;
    numberOfPages?: number;
    languageTagIds?: number[];
    publisherId?: number;
    publicationSeriesId?: number;
    publicationSeriesVolume?: string;
    publicationSeriesIssue?: string;
}
