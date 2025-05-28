import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";


export class RegistryBookReportService extends BaseService {

    async scheduleReportGeneration(params: string): Promise<AxiosResponse<string>> {
        return super.sendRequest(axios.post, `registry-book/report/schedule-generation?${params}`);
    }

    async listGeneratedReports(): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, "registry-book/report/list-reports");
    }

    async deleteReport(reportFileName: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `registry-book/report/${reportFileName}`);
    }

    async downloadReport(reportFileName: string): Promise<void> {
        const response = await axios.get(this.basePath + `registry-book/report/download/${reportFileName}`, {responseType: 'blob'})
        this.initialzeDownload(response, `${reportFileName}.pdf`, ".pdf");
    }
}

export default new RegistryBookReportService();