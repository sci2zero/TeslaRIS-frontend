import { BaseService } from "@/services/BaseService";
import axios, { type AxiosResponse } from "axios";
import type { FundingApplication, FundingApplicationIndex, FundingApplicationResult } from "@/models/FundingApplicationModel";
import { AccessRights, type DocumentFileResponse, ResourceType } from "@/models/DocumentFileModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import type { Page } from "@/models/Common";

export class FundingApplicationService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async searchFundingApplications(
        tokens: string,
        projectId: number | null = null,
        fundingCallId: number | null = null,
        funderId: number | null = null,
        result: FundingApplicationResult | null = null
    ): Promise<AxiosResponse<Page<FundingApplicationIndex>>> {
        let url = `funding-application/search?${tokens}`;
        if (projectId) {
            url += `&projectId=${projectId}`;
        }
        if (fundingCallId) {
            url += `&fundingCallId=${fundingCallId}`;
        }
        if (funderId) {
            url += `&funderId=${funderId}`;
        }
        if (result) {
            url += `&result=${result}`;
        }
        return super.sendRequest(axios.get, url);
    }

    async readFundingApplication(fundingApplicationId: number): Promise<AxiosResponse<FundingApplication>> {
        if (isNaN(fundingApplicationId) || fundingApplicationId <= 0) {
            throw new Error(`Invalid funding application ID: ${fundingApplicationId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `funding-application/${fundingApplicationId}`);
    }

    async createFundingApplication(fundingApplication: FundingApplication): Promise<AxiosResponse<FundingApplication>> {
        return super.sendRequest(axios.post, "funding-application", fundingApplication, FundingApplicationService.idempotencyKey);
    }

    async updateFundingApplication(fundingApplicationId: number, body: FundingApplication): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `funding-application/${fundingApplicationId}`, body);
    }

    async canEdit(fundingApplicationId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `funding-application/${fundingApplicationId}/can-edit`);
    }

    async addFundingApplicationDocument(fundingApplicationId: number, attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `funding-application/${fundingApplicationId}`, attachment, FundingApplicationService.idempotencyKey);
    }

    async deleteFundingApplicationDocument(fundingApplicationId: number, documentId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `funding-application/${fundingApplicationId}/${documentId}`);
    }

    async updateFundingApplicationDocument(attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `funding-application/update-document`, attachment, FundingApplicationService.idempotencyKey);
    }
}

export default new FundingApplicationService();
