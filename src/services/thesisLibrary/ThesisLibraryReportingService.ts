import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { ThesisPublicReviewResponse, ThesisReportCounts, ThesisReportRequest } from "@/models/ThesisLibraryModel";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";
import { useDownloadStore } from "@/stores/downloadStore";


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
        const downloadStore = useDownloadStore();
        if (downloadStore.isDownloading) {
            return;
        }

        const response = await axios.post(this.basePath + `thesis-library/report/download/${lang}`, body, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    
                    downloadStore.downloadProgressRef?.updateProgress(percent);
                }
            }
        });
        
        this.initialzeDownload(response, "report.docx", "");
    }

    async fetchPublicReviewDissertations(institutionId: number | null, year: number | null, notDefendedOnly: boolean, pageable: string, forMyInstitution: boolean): Promise<AxiosResponse<Page<ThesisPublicReviewResponse>>> {
        return super.sendRequest(axios.get, `thesis-library/dissertation-report?notDefendedOnly=${notDefendedOnly}${institutionId ? ("&institutionId=" + institutionId) : ""}${year ? ("&year=" + year) : ""}${forMyInstitution ? ("&forMyInstitution=" + forMyInstitution) : ""}${pageable}`);
    }
}

export default new ThesisLibraryReportingService();
