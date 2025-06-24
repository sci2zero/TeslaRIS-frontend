import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { PrepopulatedMetadata } from "@/models/Common";


export class MetadataPrepopulationService extends BaseService {

  async fetchMetadataForDoi(doi: string): Promise<AxiosResponse<PrepopulatedMetadata>> {
    return super.sendRequest(axios.get, `metadata-prepopulation?doi=${doi}`);
  }
}

export default new MetadataPrepopulationService();
