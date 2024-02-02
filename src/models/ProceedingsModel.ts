import type { Document } from "./PublicationModel";

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
