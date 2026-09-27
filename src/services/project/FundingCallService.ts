import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {FundingCall, FundingCallIndex} from "@/models/FundingCallModel";
import type {FundingType} from "@/models/FundingModel";
import {AccessRights, type DocumentFileResponse, ResourceType} from "@/models/DocumentFileModel";
import {getNameFromOrdinal} from "@/utils/EnumUtil";
import type {Page} from "@/models/Common";

export class FundingCallService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async searchFundingCalls(
        tokens: string,
        programId: number | null = null,
        onlyActive: boolean = false,
        allowedTypes: FundingType[] = []
    ): Promise<AxiosResponse<Page<FundingCallIndex>>> {
        let url = `funding-call/search?${tokens}`;
        if (programId) {
            url += `&programId=${programId}`;
        }
        if (onlyActive) {
            url += "&onlyActive=true";
        }
        allowedTypes.forEach(allowedType => {
            url += `&allowedTypes=${allowedType}`;
        });
        return super.sendRequest(axios.get, url);
    }

    async readFundingCall(fundingCallId: number): Promise<AxiosResponse<FundingCall>> {
        if (isNaN(fundingCallId) || fundingCallId <= 0) {
            throw new Error(`Invalid funding call ID: ${fundingCallId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `funding-call/${fundingCallId}`);
    }

    async canEdit(fundingCallId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `funding-call/${fundingCallId}/can-edit`);
    }

    async createFundingCall(fundingCall: FundingCall): Promise<AxiosResponse<FundingCall>> {
        return super.sendRequest(axios.post, "funding-call", fundingCall, FundingCallService.idempotencyKey);
    }

    async updateFundingCall(fundingCallId: number, body: FundingCall): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `funding-call/${fundingCallId}`, body);
    }

    async deleteFundingCall(fundingCallId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `funding-call/${fundingCallId}`);
    }

    async addCallDocument(fundingCallId: number, attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `funding-call/${fundingCallId}`, attachment, FundingCallService.idempotencyKey);
    }

    async deleteCallDocument(fundingCallId: number, documentId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `funding-call/${fundingCallId}/${documentId}`);
    }

    async updateCallDocument(attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof attachment.accessRights === "number") {
            attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        }
        if (typeof attachment.resourceType === "number") {
            attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `funding-call/update-call`, attachment, FundingCallService.idempotencyKey);
    }
}

export default new FundingCallService();
