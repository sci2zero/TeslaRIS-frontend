import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { useDownloadStore } from "@/stores/downloadStore";
import { type PolicyFileSummary, type PolicyUploadMode, type PolicyUploadResult } from "@/models/RevisionModel";


export class DataQualityPolicyService extends BaseService {

  async listPolicies(): Promise<AxiosResponse<PolicyFileSummary[]>> {
    return super.sendRequest(axios.get, "data-quality/policies");
  }

  async uploadPolicy(profileName: string, mode: PolicyUploadMode, file: File): Promise<AxiosResponse<PolicyUploadResult>> {
    return super.sendMultipartFormDataRequest(axios.post, `data-quality/policies/${profileName}?mode=${mode}`, { file });
  }

  async downloadPolicyVersion(profileName: string, version: string): Promise<void> {
    const downloadStore = useDownloadStore();

    if (downloadStore.isDownloading) {
      return;
    }

    const fileName = `${profileName}-${version}`;

    downloadStore.downloadProgressRef?.startDownload(fileName);

    const response = await axios.get(this.basePath + `data-quality/policies/${profileName}/${version}/download`, {
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

    this.initialzeDownload(response, fileName, "json");
  }
}

export default new DataQualityPolicyService();
