import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { CrisContextInformation } from "@/models/Common";

export class CrisContextInformationService extends BaseService {

  async fetchConfigurationForSystem(): Promise<AxiosResponse<CrisContextInformation>> {
    return super.sendRequest(axios.get, "cris-context-information");
  }

  async saveConfigurationForSystem(body: CrisContextInformation): Promise<AxiosResponse<CrisContextInformation>> {
    return super.sendRequest(axios.patch, "cris-context-information", body);
  }
}

export default new CrisContextInformationService();
