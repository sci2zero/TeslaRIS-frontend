import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {FundingPart} from "@/models/FundingModel";

export class FundingPartService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async createFundingPart(fundingPart: FundingPart): Promise<AxiosResponse<FundingPart>> {
        return super.sendRequest(axios.post, "funding-part", fundingPart, FundingPartService.idempotencyKey);
    }

    async updateFundingPart(fundingPartId: number, body: FundingPart): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `funding-part/${fundingPartId}`, body);
    }

    async deleteFundingPart(fundingPartId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `funding-part/${fundingPartId}`);
    }
}

export default new FundingPartService();
