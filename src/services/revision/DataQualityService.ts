import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type DataQualityAssessment, type QualityReportResponse, type ProfileRelatedQuality } from "@/models/RevisionModel";


export class DataQualityService extends BaseService {

  async getQualityReportForEntity(entityType: string, entityId: number): Promise<AxiosResponse<QualityReportResponse[]>> {
    return super.sendRequest(axios.get, `data-quality/report/${entityType}/${entityId}`);
  }

  async getLatestAssessments(entityType: string, entityId: number): Promise<AxiosResponse<DataQualityAssessment[]>> {
    return super.sendRequest(axios.get, `data-quality/assessments/${entityType}/${entityId}`);
  }

  async getRelatedQuality(entityType: string, entityId: number): Promise<AxiosResponse<ProfileRelatedQuality[]>> {
    return super.sendRequest(axios.get, `data-quality/related/${entityType}/${entityId}`);
  }

  async getAssessmentsForVersion(entityType: string, entityId: number, majorVersion: number, minorVersion: number): Promise<AxiosResponse<DataQualityAssessment[]>> {
    return super.sendRequest(axios.get, `data-quality/assessments/${entityType}/${entityId}/${majorVersion}/${minorVersion}`);
  }
}

export default new DataQualityService();
