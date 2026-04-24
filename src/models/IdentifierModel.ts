import type { AccessLevel, ApplicableEntityType, MultilingualContent } from "./Common";


export interface Identifier {
    id?: number;
    code: string;
    title: MultilingualContent[];
    description?: MultilingualContent[];
    identifierAccessLevel: AccessLevel;
    applicableTypes: ApplicableEntityType[];
    regularExpression?: string;
    uriPrefix?: string;
}

export interface IdentifierResponse {
    id: number,
    code: string,
    title: MultilingualContent[];
    description?: MultilingualContent[];
    applicableEntityTypes: ApplicableEntityType[];
    regularExpression?: string;
    uriPrefix?: string;
}

export interface EntityIdentifier {
    value: string;
    identifierId: number;
}

export interface EntityIdentifierResponse {
    id: number;
    value: string;
    identifierResponse: IdentifierResponse;
}

export interface DocumentIdentifier extends EntityIdentifier {
    documentId: number;
}

export interface EventIdentifier extends EntityIdentifier {
    eventId: number;
}

export interface PersonIdentifier extends EntityIdentifier {
    personId: number;
}

export interface PublicationSeriesIdentifier extends EntityIdentifier {
    publicationSeriesId: number;
}

export interface OrganisationUnitIdentifier extends EntityIdentifier {
    organisationUnitId: number;
}
