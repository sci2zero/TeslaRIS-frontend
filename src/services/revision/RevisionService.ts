import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type QualityReportResponse } from "@/models/RevisionModel";


export class RevisionService extends BaseService {

  async getRevisionHistory(entityType: string, entityId: number): Promise<AxiosResponse<string[]>> {
    return super.sendRequest(axios.get, `revision/${entityType}/${entityId}`);
  }

  async getRevisionAtDate(entityType: string, entityId: number, timestamp: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `revision/${entityType}/${entityId}/at?timestamp=${timestamp}`);
  }

  async getQualityReportForEntity(entityType: string, entityId: number): Promise<AxiosResponse<QualityReportResponse[]>> {
    return super.sendRequest(axios.get, `revision/quality-report/${entityType}/${entityId}`);
  }
}

export default new RevisionService();
