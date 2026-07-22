import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {FundingProgram} from "@/models/FundingModel";

export class FundingProgramService extends BaseService {

    async readFundingProgram(fundingProgramId: number): Promise<AxiosResponse<FundingProgram>> {
        if (isNaN(fundingProgramId) || fundingProgramId <= 0) {
            throw new Error(`Invalid funding program ID: ${fundingProgramId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `funding-program/${fundingProgramId}`);
    }
}

export default new FundingProgramService();
