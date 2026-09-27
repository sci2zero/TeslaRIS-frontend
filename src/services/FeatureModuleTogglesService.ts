import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { FeatureModuleToggles } from "@/models/Common";

export class FeatureModuleTogglesService extends BaseService {

  async fetchConfigurationForSystem(): Promise<AxiosResponse<FeatureModuleToggles>> {
    return super.sendRequest(axios.get, "feature-module-toggles");
  }

  async saveConfigurationForSystem(body: FeatureModuleToggles): Promise<AxiosResponse<FeatureModuleToggles>> {
    return super.sendRequest(axios.patch, "feature-module-toggles", body);
  }
}

export default new FeatureModuleTogglesService();
