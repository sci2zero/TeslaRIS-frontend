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

        const accessTokenResponse = 
            await super.sendRequest(axios.get, `document/backup/access-token`);
        if (!accessTokenResponse.data) {
            downloadStore.downloadProgressRef?.cancelDownload();
            return;
        }

        downloadStore.downloadProgressRef?.updateProgress(100);

        const downloadUrl = `${this.basePath}document/backup/download/${backupFileName}?accessToken=${accessTokenResponse.data}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = backupFileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default new DocumentBackupService();
