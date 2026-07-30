import { BaseService } from "@/services/BaseService";
import axios, { type AxiosResponse } from "axios";
import type { FundingCall } from "@/models/FundingCallModel";

export class FundingCallService extends BaseService {

    async readFundingCall(fundingCallId: number): Promise<AxiosResponse<FundingCall>> {
        return super.sendRequest(axios.get, `funding-call/${fundingCallId}`);
    }
}

export default new FundingCallService();
