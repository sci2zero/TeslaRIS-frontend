import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ResearchArea, ResearchAreaNode } from "@/models/OrganisationUnitModel";
import type { Page, ResearchAreaRequest, ResearchAreaResponse } from "@/models/Common";
import i18n from "@/i18n";


export class ResearchAreaService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async readAllResearchAreas(): Promise<AxiosResponse<ResearchArea[]>> {
    return super.sendRequest(axios.get, "research-area");
  }

  async fetchChildResearchAreas(parentId: number | null): Promise<AxiosResponse<ResearchAreaNode[]>> {
    return super.sendRequest(axios.get, `research-area/children/${parentId}`);
  }

  async listAllResearchAreas(): Promise<AxiosResponse<ResearchArea[]>> {
    return super.sendRequest(axios.get, "research-area/list");
  }

  async readResearchAreaHierarchy(researchAreaId: number): Promise<AxiosResponse<ResearchArea>> {
    return super.sendRequest(axios.get, `research-area/${researchAreaId}`);
  }

  async searchResearchAreas(tokens: string): Promise<AxiosResponse<Page<ResearchAreaResponse>>> {
    return super.sendRequest(axios.get, `research-area/search?${tokens}&lang=${i18n.vueI18n.global.locale}`);
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
