import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { PrepopulatedFundingMetadata } from "@/models/FundingModel";


export class FundingMetadataPrepopulationService extends BaseService {

    async fetchFundingDataForDoi(doi: string): Promise<AxiosResponse<PrepopulatedFundingMetadata>> {
        return super.sendRequest(axios.get, `funding-metadata-prepopulation?doi=${doi}`);
    }
}

export default new FundingMetadataPrepopulationService();