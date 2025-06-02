import { License, ResourceType, ThesisAttachmentType, type DocumentFileResponse } from "@/models/DocumentFileModel";
import { BaseService } from "./BaseService";
import axios, { type AxiosResponse } from "axios";
import { getNameFromOrdinal } from "@/utils/EnumUtil";

export class DocumentFileService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async downloadDocumentFile(serverFilename: string, fileName: string, extension: string, inline: boolean = false): Promise<void> {
        if (inline) {
            const imagePath = this.basePath + `file/${serverFilename}?inline=true`;
            window.open(imagePath, '_blank');
        } else {
            const response = await super.sendRequest(axios.get, `file/${serverFilename}`, {
                responseType: "blob",
            });

            this.initialzeDownload(response, fileName, extension);
        }
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

    async addThesisFileAttachment(attachment: any, thesisId: number, attachmentType: ThesisAttachmentType): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.license = getNameFromOrdinal(License, attachment.license);
        attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `thesis/${attachmentType}/${thesisId}`, attachment, DocumentFileService.idempotencyKey);
    }

    async updateDocumentFileAttachment(attachment: any, documentId?: number, isProof?: boolean): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof attachment.license === "number") {
            attachment.license = getNameFromOrdinal(License, attachment.license);
        }
        if (typeof attachment.resourceType === "number") {
            attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `document-file?isProof=${isProof ? "true" : "false"}${documentId ? `&documentId=${documentId}` : ""}`, attachment);
    }

    async deleteDocumentFileAttachment(publicationId: number, documentFileId: number): Promise<void> {
        return super.sendRequest(axios.delete, `document/${publicationId}/${documentFileId}`);
    }

    async deleteThesisFileAttachment(thesisId: number, documentFileId: number, attachmentType: ThesisAttachmentType): Promise<void> {
        return super.sendRequest(axios.delete, `thesis/${attachmentType}/${thesisId}/${documentFileId}`);
    }

    async addExpertiseOrSkillProof(proof: any, expertiseOrSkillId: number, personId: number): Promise<AxiosResponse<DocumentFileResponse>> {
        proof.license = getNameFromOrdinal(License, proof.license);
        proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `expertise-or-skill/${personId}/${expertiseOrSkillId}`, proof, DocumentFileService.idempotencyKey);
    }

    async updateExpertiseOrSkillProof(proof: any, personId: number): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof proof.license === "number") {
            proof.license = getNameFromOrdinal(License, proof.license);
        }
        if (typeof proof.resourceType === "number") {
            proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `expertise-or-skill/${personId}`, proof, DocumentFileService.idempotencyKey);
    }

    async deleteExpertiseOrSkillProof(proofId: number, expertiseOrSkillId: number, personId: number): Promise<void> {
        return super.sendRequest(axios.delete, `expertise-or-skill/${personId}/${expertiseOrSkillId}/${proofId}`);
    }

    async addPrizeProof(proof: any, prizeId: number, personId: number): Promise<AxiosResponse<DocumentFileResponse>> {
        proof.license = getNameFromOrdinal(License, proof.license);
        proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `prize/${personId}/${prizeId}`, proof, DocumentFileService.idempotencyKey);
    }

    async updatePrizeProof(proof: any, personId: number): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof proof.license === "number") {
            proof.license = getNameFromOrdinal(License, proof.license);
        }
        if (typeof proof.resourceType === "number") {
            proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `prize/${personId}`, proof, DocumentFileService.idempotencyKey);
    }

    async deletePrizeProof(proofId: number, prizeId: number, personId: number): Promise<void> {
        return super.sendRequest(axios.delete, `prize/${personId}/${prizeId}/${proofId}`);
    }
}

export default new DocumentFileService();
