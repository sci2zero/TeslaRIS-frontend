import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ResearchArea } from "@/models/OrganisationUnitModel";
import type { Page, ResearchAreaRequest, ResearchAreaResponse } from "@/models/Common";

export class ResearchAreaService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async readAllResearchAreas(): Promise<AxiosResponse<ResearchArea[]>> {
    return super.sendRequest(axios.get, "research-area");
  }

  async listAllResearchAreas(): Promise<AxiosResponse<ResearchArea[]>> {
    return super.sendRequest(axios.get, "research-area/list");
  }

  async readResearchAreaHierarchy(researchAreaId: number): Promise<AxiosResponse<ResearchArea>> {
    return super.sendRequest(axios.get, `research-area/${researchAreaId}`);
  }

  async searchResearchAreas(tokens: string): Promise<AxiosResponse<Page<ResearchAreaResponse>>> {
    return super.sendRequest(axios.get, `research-area/search?${tokens}`);
  }

  async createResearchArea(body: ResearchAreaRequest): Promise<AxiosResponse<ResearchAreaRequest>> {
    return super.sendRequest(axios.post, "research-area", body, ResearchAreaService.idempotencyKey);
  }

  async updateResearchArea(researchAreaId: number, body: ResearchAreaRequest): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `research-area/${researchAreaId}`, body);
  }

  async deleteResearchArea(researchAreaId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `research-area/${researchAreaId}`);
  }
}

export default new ResearchAreaService();
