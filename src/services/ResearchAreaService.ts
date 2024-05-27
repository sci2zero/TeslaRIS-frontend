import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ResearchArea } from "@/models/OrganisationUnitModel";

export class ResearchAreaService extends BaseService {

  async readAllResearchAreas(): Promise<AxiosResponse<ResearchArea[]>> {
    return super.sendRequest(axios.get, "research-area");
  }

  async listAllResearchAreas(): Promise<AxiosResponse<ResearchArea[]>> {
    return super.sendRequest(axios.get, "research-area/list");
  }

  async readResearchAreaHierarchy(researchAreaId: number): Promise<AxiosResponse<ResearchArea>> {
    return super.sendRequest(axios.get, `research-area/${researchAreaId}`);
  }
}

export default new ResearchAreaService();
