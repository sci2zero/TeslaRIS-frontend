import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type DimensionQuality, type EntityTypeQuality, type PublicationCandidateAnalysis, type RepositoryOverview } from "@/models/RevisionModel";
import { useDownloadStore } from "@/stores/downloadStore";


export class RepositoryAnalyticsService extends BaseService {

  async getOverview(profileName: string, assessmentDate: string | undefined): Promise<AxiosResponse<RepositoryOverview>> {
    return super.sendRequest(axios.get, `repository-analytics/overview?${this.analyticsParams(profileName, assessmentDate)}`);
  }

  async getPublicationCandidateAnalysis(profileName: string, assessmentDate: string | undefined): Promise<AxiosResponse<PublicationCandidateAnalysis>> {
    return super.sendRequest(axios.get, `repository-analytics/publication-candidates?${this.analyticsParams(profileName, assessmentDate)}`);
  }

  async getQualityByEntityType(profileName: string, assessmentDate: string | undefined): Promise<AxiosResponse<EntityTypeQuality[]>> {
    return super.sendRequest(axios.get, `repository-analytics/entity-types?${this.analyticsParams(profileName, assessmentDate)}`);
  }

  async getQualityByDimension(profileName: string, assessmentDate: string | undefined): Promise<AxiosResponse<DimensionQuality[]>> {
    return super.sendRequest(axios.get, `repository-analytics/dimensions?${this.analyticsParams(profileName, assessmentDate)}`);
  }

  async downloadPublicationCandidateAnalysis(profileName: string, assessmentDate: string | undefined, language: string): Promise<void> {
    return this.downloadReport("publication-candidates", "publication-candidate-analysis", profileName, assessmentDate, language);
  }

  async downloadOverview(profileName: string, assessmentDate: string | undefined, language: string): Promise<void> {
    return this.downloadReport("overview", "repository-quality-overview", profileName, assessmentDate, language);
  }

  async downloadQualityByEntityType(profileName: string, assessmentDate: string | undefined, language: string): Promise<void> {
    return this.downloadReport("entity-types", "quality-by-entity-type", profileName, assessmentDate, language);
  }

  async downloadQualityByDimension(profileName: string, assessmentDate: string | undefined, language: string): Promise<void> {
    return this.downloadReport("dimensions", "quality-by-dimension", profileName, assessmentDate, language);
  }

  private async downloadReport(report: string, fileName: string, profileName: string, assessmentDate: string | undefined, language: string): Promise<void> {
    const downloadStore = useDownloadStore();

    if (downloadStore.isDownloading) {
      return;
    }

    downloadStore.downloadProgressRef?.startDownload(fileName);

    const params = `${this.analyticsParams(profileName, assessmentDate)}&language=${language}`;

    const response = await axios.get(this.basePath + `repository-analytics/${report}/download?${params}`, {
      responseType: "blob",
      onDownloadProgress: (progressEvent: any) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          downloadStore.downloadProgressRef?.updateProgress(percent);
        }
      }
    }).catch(error => {
      downloadStore.downloadProgressRef?.cancelDownload();
      throw error;
    });

    // A response without a content length never reports progress, so the bar is closed explicitly
    // rather than left spinning.
    downloadStore.downloadProgressRef?.updateProgress(100);

    this.initialzeDownload(response, fileName, "xlsx");
  }

  private analyticsParams(profileName: string, assessmentDate: string | undefined): string {
    const params = new URLSearchParams({ profileName });

    if (assessmentDate) {
      params.append("assessmentDate", assessmentDate.split("T")[0]);
    }

    return params.toString();
  }
}

export default new RepositoryAnalyticsService();
