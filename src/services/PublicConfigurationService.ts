import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { PublicConfiguration } from "@/models/PublicConfiguration";

export class PublicConfigurationService extends BaseService {

    async fetchPublicConfiguration(): Promise<AxiosResponse<PublicConfiguration>> {
        return super.sendRequest(axios.get, "public-configuration");
    }
}

export default new PublicConfigurationService();
