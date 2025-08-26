import type { MultilingualContent } from "./Common";
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
    acronym?: MultilingualContent[];
}

export interface ProceedingsResponse extends Proceedings {
    eventName: MultilingualContent[];
    publisherName: MultilingualContent[];
}
