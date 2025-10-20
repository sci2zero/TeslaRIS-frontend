import type { AxiosResponse } from "axios";
import axios from "axios";
import { BaseService } from "../BaseService";
import { StatisticsType } from "@/models/AssessmentModel";
import type { Page, StatisticsByCountry } from "@/models/Common";
import type { DocumentPublicationIndex, PublicationType, ThesisType } from "@/models/PublicationModel";


export class DocumentVisualizationService extends BaseService {

    async getDocumentStatisticsByCountry(documentId: number, statisticsType: StatisticsType, startDate: string, endDate: string): Promise<AxiosResponse<StatisticsByCountry[]>> {
        return super.sendRequest(axios.get, `visualization-data/document/statistics/${documentId}/${statisticsType}?startDate=${startDate}&endDate=${endDate}`);
    }

    async getMonthlyStatisticsForDocument(documentId: number, statisticsType: StatisticsType, startDate: string, endDate: string): Promise<AxiosResponse<Record<string, number>>> {
        return super.sendRequest(axios.get, `visualization-data/document/monthly-statistics/${documentId}/${statisticsType}?startDate=${startDate}&endDate=${endDate}`);
    }

    async getPublicationsForTypeAndPeriod(type: PublicationType, subType: ThesisType | null, personId: number, institutionId: number, yearFrom: number, yearTo: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.get, `visualization-data/document/publications?type=${type}${subType ? ("&subType=" + subType) : ""}&personId=${personId}&institutionId=${institutionId}&yearFrom=${yearFrom}&yearTo=${yearTo}${pageable}`);
    }
}

export default new DocumentVisualizationService();
