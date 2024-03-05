import type { MultilingualContent } from "./Common";

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
}

export interface OrganisationUnitResponse {
    id: number;
    name: MultilingualContent[];
    nameAbbreviation?: string;
    keyword: MultilingualContent[];
    researchAreas: ResearchArea[];
    location?: GeoLocation;
    contact?: Contact;
}

export interface ResearchArea {
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