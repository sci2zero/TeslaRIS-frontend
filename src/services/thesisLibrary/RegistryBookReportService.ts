import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { useDownloadStore } from "@/stores/downloadStore";


export class RegistryBookReportService extends BaseService {

    async scheduleReportGeneration(params: string, recurrence: string): Promise<AxiosResponse<string>> {
        return super.sendRequest(axios.post, `registry-book/report/schedule-generation?${params}&recurrence=${recurrence}`);
    }

    async listGeneratedReports(): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, "registry-book/report/list-reports");
    }

    async deleteReport(reportFileName: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `registry-book/report/${reportFileName}`);
    }

    async downloadReport(reportFileName: string): Promise<void> {
        const downloadStore = useDownloadStore();
        if (downloadStore.isDownloading) {
            return;
        }

        downloadStore.downloadProgressRef?.startDownload(reportFileName);

        const response = await axios.get(this.basePath + `registry-book/report/download/${reportFileName}`,
            {
                responseType: "blob",
                onDownloadProgress: (progressEvent: any) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        
                        downloadStore.downloadProgressRef?.updateProgress(percent);
                    }
                }
            }
        ).catch(error => {
            downloadStore.downloadProgressRef?.cancelDownload();
            throw error;
        });

        // A response without a content length never reports progress, so the bar is closed
        // explicitly rather than left spinning.
        downloadStore.downloadProgressRef?.updateProgress(100);

        this.initialzeDownload(response, `${reportFileName}`, "");
    }
}

export default new RegistryBookReportService();