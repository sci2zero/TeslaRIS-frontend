import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { ThesisReportCounts, ThesisReportRequest } from "@/models/ThesisLibraryModel";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";


export class ThesisLibraryReportingService extends BaseService {

    async getReportCounts(body: ThesisReportRequest): Promise<AxiosResponse<ThesisReportCounts[]>> {
        return super.sendRequest(axios.post, "thesis-library/report/counts", body);
    }

    async getDefendedThesesForPeriod(body: ThesisReportRequest, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.post, `thesis-library/report/defended?${pageable}`, body);
    }

    async getAcceptedThesesForPeriod(body: ThesisReportRequest, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.post, `thesis-library/report/accepted?${pageable}`, body);
    }

    async getPublicReviewThesesForPeriod(body: ThesisReportRequest, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.post, `thesis-library/report/public-review?${pageable}`, body);
    }

    async getPubliclyAvailableThesesForPeriod(body: ThesisReportRequest, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.post, `thesis-library/report/public-access?${pageable}`, body);
    }

    async downloadReport(body: ThesisReportRequest, lang: string): Promise<void> {
        const response = await axios.post(this.basePath + `thesis-library/report/download/${lang}`, body, {responseType: 'blob'})
        this.initialzeDownload(response, "report.docx", ".docx");
    }
}

export default new ThesisLibraryReportingService();
