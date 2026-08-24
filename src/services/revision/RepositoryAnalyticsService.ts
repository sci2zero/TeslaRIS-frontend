import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type EntityTypeQuality } from "@/models/RevisionModel";


export class RepositoryAnalyticsService extends BaseService {

  async getQualityByEntityType(profileName: string, assessmentDate: string | undefined): Promise<AxiosResponse<EntityTypeQuality[]>> {
    const params = new URLSearchParams({ profileName });

    if (assessmentDate) {
      params.append("assessmentDate", assessmentDate.split("T")[0]);
    }

    return super.sendRequest(axios.get, `repository-analytics/entity-types?${params.toString()}`);
  }
}

export default new RepositoryAnalyticsService();
