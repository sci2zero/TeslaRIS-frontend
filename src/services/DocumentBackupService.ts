import { useDownloadStore } from "@/stores/downloadStore";
import { BaseService } from "./BaseService";
import axios, { type AxiosResponse } from "axios";


export class DocumentBackupService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async scheduleGeneration(params: string, recurrence: string): Promise<AxiosResponse<string>> {
        return super.sendRequest(axios.post, `document/backup/schedule-generation?${params}&recurrence=${recurrence}`, {}, DocumentBackupService.idempotencyKey);
    }

    async listBackups(): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, "document/backup/list-backups");
    }

    async downloadBackupFile(backupFileName: string): Promise<void> {
        const downloadStore = useDownloadStore();
        if (downloadStore.isDownloading) {
            return;
        }

        downloadStore.downloadProgressRef?.startDownload(backupFileName);
        const response = await super.sendRequest(axios.get, `document/backup/download/${backupFileName}`, {
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
        
        this.initialzeDownload(response, backupFileName, ".zip");
    }
}

export default new DocumentBackupService();
