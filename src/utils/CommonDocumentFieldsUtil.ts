import { mergeMultilingualContentField } from '@/i18n/MultilingualContentUtil';
import type { CommonFieldsData, Document, PersonDocumentContribution } from '@/models/PublicationModel';
import type { Ref } from 'vue';
import { bulkTransferFields } from './FieldTransferUtil';
import { mergeDocumentAttachments } from './AttachmentUtil';


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
    document.value!.title = basicInfo.title;
    document.value!.subTitle = basicInfo.subTitle;
    document.value!.description = basicInfo.description;
    document.value!.keywords = basicInfo.keywords;
    document.value!.uris = basicInfo.uris;
    document.value!.documentDate = basicInfo.documentDate;
    document.value!.doi = basicInfo.doi;
    document.value!.scopusId = basicInfo.scopusId;
    document.value!.openAlexId = basicInfo.openAlexId;
    document.value!.webOfScienceId = basicInfo.webOfScienceId;
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
    document.value!.eventId = basicInfo.eventId;
};

export const mergeCommonMetadata = (document1: Document, document2: Document) => {
    mergeMultilingualContentField(document1.title, document2.title);

    mergeMultilingualContentField(document1.subTitle, document2.subTitle);
    document2.subTitle = [];

    mergeDocumentAttachments(document1, document2);

    mergeMultilingualContentField(document1.keywords, document2.keywords);
    document2.keywords = [];

    mergeMultilingualContentField(document1.description, document2.description);
    document2.description = [];

    mergeMultilingualContentField(document1.geoSpaceDescription, document2.geoSpaceDescription);
    document2.geoSpaceDescription = [];

    mergeMultilingualContentField(document1.chronologicalSpaceDescription, document2.chronologicalSpaceDescription);
    document2.chronologicalSpaceDescription = [];

    mergeMultilingualContentField(document1.city, document2.city);
    document2.city = [];

    bulkTransferFields(document1, document2, [
        { fieldName: "doi", emptyValue: "" },
        { fieldName: "scopusId", emptyValue: "" },
        { fieldName: "openAlexId", emptyValue: "" },
        { fieldName: "webOfScienceId", emptyValue: "" },
        { fieldName: "documentDate", emptyValue: null, setEmpty: false },
        { fieldName: "handleId", emptyValue: "" },
        { fieldName: "arxivId", emptyValue: "" },
        { fieldName: "pubmedId", emptyValue: "" },
        { fieldName: "ssrnId", emptyValue: "" },
        { fieldName: "peerReviewed", emptyValue: false },
        { fieldName: "openAccess", emptyValue: false },
        { fieldName: "publicationStatus", emptyValue: null, setEmpty: false },
        { fieldName: "eventId", emptyValue: null, setEmpty: false }
    ]);

    document2.uris!.forEach(uri => {
        if (!document1.uris!.includes(uri)) {
            document1.uris!.push(uri);
        }
    });
    document2.uris = [];

    document1.contributions = document1.contributions?.concat(document2.contributions as PersonDocumentContribution[]);
    document2.contributions = [];
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
