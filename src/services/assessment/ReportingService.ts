import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type Report } from "@/models/AssessmentModel";
import { useDownloadStore } from "@/stores/downloadStore";


export class ReportingService extends BaseService {

    async fetchAllGeneratedReportsForCommission(commissionId: number): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `assessment/report/${commissionId}`);
    }

    async fetchAllGeneratedReports(): Promise<AxiosResponse<Report[]>> {
        return super.sendRequest(axios.get, "assessment/report");
    }

    async downloadReport(reportFileName: string, commissionId: number): Promise<void> {
        const downloadStore = useDownloadStore();
        if (downloadStore.isDownloading) {
            return;
        }

        downloadStore.downloadProgressRef?.startDownload(reportFileName);

        const response = await super.sendRequest(axios.get, `assessment/report/download/${reportFileName}/${commissionId}`, {
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

        // A response without a content length never reports progress, so the bar is closed
        // explicitly rather than left spinning.
        downloadStore.downloadProgressRef?.updateProgress(100);
        
        this.initialzeDownload(response, reportFileName, reportFileName.split(".")[1]);
    }
}

export default new ReportingService();