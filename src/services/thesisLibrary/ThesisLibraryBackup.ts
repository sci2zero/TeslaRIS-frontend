import { useDownloadStore } from "@/stores/downloadStore";
import { BaseService } from "../BaseService";
import axios, { type AxiosResponse } from "axios";


export class ThesisLibraryBackupService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async scheduleGeneration(params: string, recurrence: string): Promise<AxiosResponse<string>> {
        return super.sendRequest(axios.post, `thesis-library/backup/schedule-generation?${params}&recurrence=${recurrence}`, {}, ThesisLibraryBackupService.idempotencyKey);
    }

    async listBackups(): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, "thesis-library/backup/list-backups");
    }

    async downloadBackupFile(backupFileName: string): Promise<void> {
        const downloadStore = useDownloadStore();
        if (downloadStore.isDownloading) {
            return;
        }

        downloadStore.downloadProgressRef?.startDownload(backupFileName);
        const response = await super.sendRequest(axios.get, `thesis-library/backup/download/${backupFileName}`, {
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

export default new ThesisLibraryBackupService();
