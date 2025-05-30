import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type Report } from "@/models/AssessmentModel";


export class ReportingService extends BaseService {

    async fetchAllGeneratedReportsForCommission(commissionId: number): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `assessment/report/${commissionId}`);
    }

    async fetchAllGeneratedReports(): Promise<AxiosResponse<Report[]>> {
        return super.sendRequest(axios.get, "assessment/report");
    }

    async downloadReport(reportFileName: string, commissionId: number): Promise<void> {
        const response = await super.sendRequest(axios.get, `assessment/report/download/${reportFileName}/${commissionId}`, {
            responseType: 'blob',
        });
        this.initialzeDownload(response, reportFileName, reportFileName.split(".")[1]);
    }
}

export default new ReportingService();