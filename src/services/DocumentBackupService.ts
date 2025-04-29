import { BaseService } from "./BaseService";
import axios, { type AxiosResponse } from "axios";


export class DocumentBackupService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async scheduleGeneration(params: string): Promise<AxiosResponse<string>> {
        return super.sendRequest(axios.post, `document/backup/schedule-generation?${params}`, {}, DocumentBackupService.idempotencyKey);
    }

    async listBackups(): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, "document/backup/list-backups");
    }

    async downloadBackupFile(backupFileName: string): Promise<void> {
        const response = await super.sendRequest(axios.get, `document/backup/download/${backupFileName}`, {
            responseType: 'blob',
        });
        this.initialzeDownload(response, backupFileName, ".zip");
    }
}

export default new DocumentBackupService();
