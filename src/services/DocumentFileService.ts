import { License, ResourceType, type DocumentFileResponse } from "@/models/DocumentFileModel";
import { BaseService } from "./BaseService";
import axios, { type AxiosResponse } from "axios";
import { getNameFromOrdinal } from "@/utils/EnumUtil";

export class DocumentFileService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async downloadDocumentFile(serverFilename: string, fileName: string, extension: string): Promise<void> {
        const response = await super.sendRequest(axios.get, `file/${serverFilename}`, {
            responseType: 'blob',
        });
        this.initialzeDownload(response, fileName, extension);
    }

    async addInvolvementProof(proof: any, involvementId: number, personId: number): Promise<AxiosResponse<DocumentFileResponse>> {
        proof.license = getNameFromOrdinal(License, proof.license);
        proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `involvement/${involvementId}/${personId}`, proof, DocumentFileService.idempotencyKey);
    }

    async updateInvolvementProof(proof: any, proofId: any, involvementId: number, personId: number): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof proof.license === "number") {
            proof.license = getNameFromOrdinal(License, proof.license);
        }
        if (typeof proof.resourceType === "number") {
            proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `involvement/${involvementId}/${personId}/${proofId}`, proof, DocumentFileService.idempotencyKey);
    }

    async deleteInvolvementProof(proofId: number, involvementId: number, personId: number): Promise<void> {
        return super.sendRequest(axios.delete, `involvement/${involvementId}/${personId}/${proofId}`);
    }

    async addDocumentFileAttachment(attachment: any, publicationId: number, isProof: boolean): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.license = getNameFromOrdinal(License, attachment.license);
        attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `document/${publicationId}?isProof=${isProof}`, attachment, DocumentFileService.idempotencyKey);
    }

    async updateDocumentFileAttachment(attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof attachment.license === "number") {
            attachment.license = getNameFromOrdinal(License, attachment.license);
        }
        if (typeof attachment.resourceType === "number") {
            attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, "document-file", attachment);
    }

    async deleteDocumentFileAttachment(publicationId: number, documentFileId: number): Promise<void> {
        return super.sendRequest(axios.delete, `document/${publicationId}/${documentFileId}`);
    }
}

export default new DocumentFileService();