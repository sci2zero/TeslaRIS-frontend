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
        const response = await super.sendRequest(axios.get, `thesis-library/backup/download/${backupFileName}`, {
            responseType: 'blob',
        });
        this.initialzeDownload(response, backupFileName, ".zip");
    }
}

export default new ThesisLibraryBackupService();
