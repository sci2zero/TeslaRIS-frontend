import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {Funding} from "@/models/FundingModel";
import {AccessRights, type DocumentFileResponse, ResourceType} from "@/models/DocumentFileModel";
import {getNameFromOrdinal} from "@/utils/EnumUtil";

export class FundingService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async readFunding(fundingId: number): Promise<AxiosResponse<Funding>> {
        if (isNaN(fundingId) || fundingId <= 0) {
            throw new Error(`Invalid funding ID: ${fundingId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `funding/${fundingId}`);
    }

    async updateFunding(fundingId: number, body: Funding): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `funding/${fundingId}`, body);
    }

    async canEdit(fundingId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `funding/${fundingId}/can-edit`);
    }

    async addAgreementDocument(fundingId: number, attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `funding/${fundingId}`, attachment, FundingService.idempotencyKey);
    }

    async deleteAgreementDocument(fundingId: number, documentId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `funding/${fundingId}/${documentId}`);
    }

    async updateAgreementDocument(attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        console.log("attachment before conversion:", JSON.stringify(attachment, null, 2));

        attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);

        return super.sendMultipartFormDataRequest(axios.patch, `funding/update-agreement`, attachment, FundingService.idempotencyKey);
    }
}

export default new FundingService();