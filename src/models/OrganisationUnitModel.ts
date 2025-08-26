import type { MultilingualContent } from "./Common";
import type { DocumentFileResponse } from "./DocumentFileModel";
import { ThesisType } from "./PublicationModel";

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
    superOUId: number;
    superOUNameSr: string;
    superOUNameSrSortable: string;
    superOUNameOther: string;
    superOUNameOtherSortable: string;
    allowedThesisTypes: ThesisType[];
}

export interface OrganisationUnitRequest {
    name: MultilingualContent[];
    nameAbbreviation?: string;
    keyword: MultilingualContent[];
    researchAreasId: number[];
    location?: GeoLocation;
    contact?: Contact;
    scopusAfid?: string;
    openAlexId?: string;
    ror? : string;
    uris: string[];
    allowedThesisTypes: ThesisType[];
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
    openAlexId?: string;
    ror? : string;
    uris: string[];
    logoServerFilename?: string;
    logoBackgroundHex: string;
    allowedThesisTypes: ThesisType[];
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

export interface ResearchAreaNode {
    id : number;
    name: MultilingualContent[];
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

export interface InstitutionLogoRequest {
    file: File
    top: number;
    left: number;
    height: number;
    width: number;
    backgroundHex: string;
}

export interface OrganisationUnitTrustConfiguration {
    trustNewPublications: boolean;
    trustNewDocumentFiles: boolean;
}

export interface OrganisationUnitOutputConfiguration {
    showOutputs: boolean;
    showBySpecifiedAffiliation: boolean;
    showByPublicationYearEmployments: boolean;
    showByCurrentEmployments: boolean;
}

export interface OrganisationUnitImportSource {
    importScopus: boolean;
    importOpenAlex: boolean;
    importWebOfScience: boolean;
    scopusConfigured?: boolean;
    webOfScienceConfigured?: boolean;
}

export interface InstitutionDefaultSubmissionContent {
    placeOfKeep: MultilingualContent[];
    typeOfTitle: MultilingualContent[];
}
