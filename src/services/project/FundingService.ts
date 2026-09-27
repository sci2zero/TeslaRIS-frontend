import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {Funding, FundingIndex} from "@/models/FundingModel";
import type {Page} from "@/models/Common";
import {AccessRights, type DocumentFileResponse, ResourceType} from "@/models/DocumentFileModel";
import {getNameFromOrdinal} from "@/utils/EnumUtil";

export class FundingService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async searchFunding(tokens: string, fundingCallId: number | null = null, projectId: number | null = null): Promise<AxiosResponse<Page<FundingIndex>>> {
        return super.sendRequest(axios.get, `funding/search?${tokens}${fundingCallId ? `&fundingCallId=${fundingCallId}` : ""}${projectId ? `&projectId=${projectId}` : ""}`);
    }

    async readFunding(fundingId: number): Promise<AxiosResponse<Funding>> {
        if (isNaN(fundingId) || fundingId <= 0) {
            throw new Error(`Invalid funding ID: ${fundingId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `funding/${fundingId}`);
    }

    async createFunding(funding: Funding): Promise<AxiosResponse<Funding>> {
        return super.sendRequest(axios.post, "funding", funding, FundingService.idempotencyKey);
    }

    async updateFunding(fundingId: number, body: Funding): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `funding/${fundingId}`, body);
    }

    async deleteFunding(fundingId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `funding/${fundingId}`);
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
        if (typeof attachment.accessRights === "number") {
            attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        }
        if (typeof attachment.resourceType === "number") {
            attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `funding/update-agreement`, attachment, FundingService.idempotencyKey);
    }
}

export default new FundingService();
