import type { CommonFieldsData, Document } from '@/models/PublicationModel';
import type { Ref } from 'vue';


export const extractCommonFields = <T extends Partial<CommonFieldsData>>(
    document: T | undefined
): CommonFieldsData => {
    if (!document) return {};
    
    return {
        handleId: document.handleId,
        arxivId: document.arxivId,
        pubmedId: document.pubmedId,
        ssrnId: document.ssrnId,
        city: document.city,
        geoSpaceDescription: document.geoSpaceDescription,
        chronologicalSpaceDescription: document.chronologicalSpaceDescription,
        peerReviewed: document.peerReviewed,
        openAccess: document.openAccess,
        publicationStatus: document.publicationStatus
    };
};

export const getPresetCommonFields = <T extends Partial<CommonFieldsData>>(
    document: T | undefined
): CommonFieldsData => {
    return extractCommonFields(document);
};

export const updateDocumentCommonFields = <T extends Partial<CommonFieldsData>>(
    document: T | undefined,
    target: Ref<CommonFieldsData | undefined>
) => {
    target.value = extractCommonFields(document);
};

export const updateCommonBasicInfo = (document: Ref<Document | undefined>, basicInfo: Document) => {
    document.value!.handleId = basicInfo.handleId;
    document.value!.arxivId = basicInfo.arxivId;
    document.value!.pubmedId = basicInfo.pubmedId;
    document.value!.ssrnId = basicInfo.ssrnId;
    document.value!.peerReviewed = basicInfo.peerReviewed;
    document.value!.openAccess = basicInfo.openAccess;
    document.value!.city = basicInfo.city;
    document.value!.geoSpaceDescription = basicInfo.geoSpaceDescription;
    document.value!.chronologicalSpaceDescription = basicInfo.chronologicalSpaceDescription;
    document.value!.publicationStatus = basicInfo.publicationStatus;
};

type IdentifierValue = string | undefined;

const getValue = (value: IdentifierValue): string => {
    return typeof value === 'string' ? value : "";
};

export const getCommonIdentifiers = (
    doi: IdentifierValue,
    scopus: IdentifierValue,
    openAlexId: IdentifierValue,
    webOfScienceId: IdentifierValue,
    handleId: IdentifierValue,
    arxivId: IdentifierValue,
    pubmedId: IdentifierValue,
    ssrnId: IdentifierValue
) => [
    { value: getValue(doi), error: "doiExistsError" },
    { value: getValue(scopus), error: "scopusIdExistsError" },
    { value: getValue(openAlexId), error: "openAlexIdExistsError" },
    { value: getValue(webOfScienceId), error: "webOfScienceIdExistsError" },
    { value: getValue(handleId), error: "handleIdExistsError" },
    { value: getValue(arxivId), error: "arxivIdExistsError" },
    { value: getValue(pubmedId), error: "pubmedIdExistsError" },
    { value: getValue(ssrnId), error: "ssrnIdExistsError" },
];
