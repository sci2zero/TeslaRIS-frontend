import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { LoadingConfiguration } from "@/models/LoadModel";


export class LoadingConfigurationService extends BaseService {

    async fetchLoadingConfiguration(institutionId: number | null = null): Promise<AxiosResponse<LoadingConfiguration>> {
        return super.sendRequest(axios.get, `loading-configuration${institutionId ? "?institutionId=" + institutionId : ""}`);
    }

    async saveLoadingConfiguration(body: LoadingConfiguration, institutionId: number | null = null): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `loading-configuration${institutionId ? "?institutionId=" + institutionId : ""}`, body);
    }
}
  
export default new LoadingConfigurationService();
