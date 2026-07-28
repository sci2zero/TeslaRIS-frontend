import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type QualityReportResponse } from "@/models/RevisionModel";


export class DataQualityService extends BaseService {

  async getQualityReportForEntity(entityType: string, entityId: number): Promise<AxiosResponse<QualityReportResponse[]>> {
    return super.sendRequest(axios.get, `data-quality/report/${entityType}/${entityId}`);
  }
}

export default new DataQualityService();
