import type { MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";

export interface OrganisationUnitIndex {
    id: string;
    nameSr: string;
    nameSrSortable: string;
    nameOther: string;
    nameOtherSortable: string;
    keywordsSr: string;
    keywordsOther: string;
    researchAreasSr: string;
    researchAreasSrSortable: string;
    researchAreasOther: string;
    researchAreasOtherSortable: string;
    databaseId: number;
    superOUNameSr: string;
    superOUNameSrSortable: string;
    superOUNameOther: string;
    superOUNameOtherSortable: string;
}

export interface OrganisationUnitRequest {
    name: MultilingualContent[];
    nameAbbreviation?: string;
    keyword: MultilingualContent[];
    researchAreasId: number[];
    location?: GeoLocation;
    contact?: Contact;
    scopusAfid?: string;
}

export interface OrganisationUnitResponse {
    id: number;
    name: MultilingualContent[];
    nameAbbreviation?: string;
    keyword: MultilingualContent[];
    researchAreas: ResearchArea[];
    location?: GeoLocation;
    contact?: Contact;
    scopusAfid?: string;
}

export enum OrganisationUnitsRelationType {
    BELONGS_TO = "BELONGS_TO",
    MEMBER_OF = "MEMBER_OF",
}

export interface OrganisationUnitRelationResponse {
    id: number;
    sourceAffiliationStatement: MultilingualContent[];
    targetAffiliationStatement: MultilingualContent[];
    relationType: OrganisationUnitsRelationType;
    dateFrom: string;
    dateTo: string;
    proofs: DocumentFileResponse[];
    sourceOrganisationUnitName: MultilingualContent[];
    sourceOrganisationUnitId: number;
    targetOrganisationUnitName: MultilingualContent[];
    targetOrganisationUnitId: number;
}

export interface OrganisationUnitRelationRequest {
    id: number,
    sourceAffiliationStatement: MultilingualContent[];
    targetAffiliationStatement: MultilingualContent[];
    relationType: OrganisationUnitsRelationType;
    dateFrom: string;
    dateTo: string;
    sourceOrganisationUnitId: number;
    targetOrganisationUnitId: number;
}

export interface ResearchArea {
    id? : number;
    name: MultilingualContent[];
    description: MultilingualContent[];
    superResearchArea?: ResearchArea;
}

interface Contact {
    contactEmail: string;
    phoneNumber: string;
}

interface GeoLocation {
    longitude: number;
    latitude: number;
    address?: string;
}