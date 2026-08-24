import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type DataQualityAssessment, type DataQualityIssue, type DataQualityIssueDetails, type DataQualityProfile, type DataQualityProfileSummary, type QualityReportResponse, type ProfileRelatedQuality } from "@/models/RevisionModel";
import type { Page } from "@/models/Common";


export class DataQualityService extends BaseService {

  async canAssessDataQuality(entityType: string, entityId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `data-quality/${entityType}/${entityId}/can-assess`);
  }
  
  async getQualityReportForEntity(entityType: string, entityId: number): Promise<AxiosResponse<QualityReportResponse[]>> {
    return super.sendRequest(axios.get, `data-quality/report/${entityType}/${entityId}`);
  }

  async getLatestAssessments(entityType: string, entityId: number): Promise<AxiosResponse<DataQualityAssessment[]>> {
    return super.sendRequest(axios.get, `data-quality/assessments/${entityType}/${entityId}`);
  }

  async getRelatedQuality(entityType: string, entityId: number): Promise<AxiosResponse<ProfileRelatedQuality[]>> {
    return super.sendRequest(axios.get, `data-quality/related/${entityType}/${entityId}`);
  }

  async getIssuesForEntity(entityType: string, entityId: number, profileName: string, target: string | undefined, dimension: string | undefined, severity: string | undefined, constraintKey: string | undefined, page: number, size: number): Promise<AxiosResponse<Page<DataQualityIssue>>> {
    const params = new URLSearchParams({ profileName, page: `${page}`, size: `${size}` });

    if (target) {
      params.append("target", target);
    }

    if (dimension) {
      params.append("dimension", dimension);
    }

    if (severity) {
      params.append("severity", severity);
    }

    if (constraintKey) {
      params.append("constraintKey", constraintKey);
    }

    return super.sendRequest(axios.get, `data-quality/issues/${entityType}/${entityId}?${params.toString()}`);
  }

  async getIssueDetails(assessmentId: number, ruleKey: string): Promise<AxiosResponse<DataQualityIssueDetails>> {
    return super.sendRequest(axios.get, `data-quality/issue/${assessmentId}/${ruleKey}`);
  }

  async listProfileNames(): Promise<AxiosResponse<DataQualityProfileSummary[]>> {
    return super.sendRequest(axios.get, "data-quality/profiles/names");
  }

  async listProfiles(): Promise<AxiosResponse<DataQualityProfile[]>> {
    return super.sendRequest(axios.get, "data-quality/profiles");
  }

  async getAssessmentsForVersion(entityType: string, entityId: number, majorVersion: number, minorVersion: number): Promise<AxiosResponse<DataQualityAssessment[]>> {
    return super.sendRequest(axios.get, `data-quality/assessments/${entityType}/${entityId}/${majorVersion}/${minorVersion}`);
  }
}

export default new DataQualityService();
