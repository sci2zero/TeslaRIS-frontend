import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {FundingProgram} from "@/models/FundingModel";
import {AccessRights, type DocumentFileResponse, ResourceType} from "@/models/DocumentFileModel";
import {getNameFromOrdinal} from "@/utils/EnumUtil";

export class FundingProgramService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async canEdit(fundingProgramId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `funding-program/${fundingProgramId}/can-edit`);
    }

    async readFundingProgram(fundingProgramId: number): Promise<AxiosResponse<FundingProgram>> {
        if (isNaN(fundingProgramId) || fundingProgramId <= 0) {
            throw new Error(`Invalid funding program ID: ${fundingProgramId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `funding-program/${fundingProgramId}`);
    }

    async updateFundingProgram(fundingProgramId: number, body: FundingProgram): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `funding-program/${fundingProgramId}`, body);
    }

    async addDocument(fundingProgramId: number, attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        return super.sendMultipartFormDataRequest(axios.patch, `funding-program/${fundingProgramId}`, attachment, FundingProgramService.idempotencyKey);
    }

    async deleteDocument(fundingProgramId: number, documentId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `funding-program/${fundingProgramId}/${documentId}`);
    }

    async updateDocument(attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        attachment.accessRights = getNameFromOrdinal(AccessRights, attachment.accessRights);
        return super.sendMultipartFormDataRequest(axios.patch, `funding-program/update-document`, attachment, FundingProgramService.idempotencyKey);
    }
}

export default new FundingProgramService();
