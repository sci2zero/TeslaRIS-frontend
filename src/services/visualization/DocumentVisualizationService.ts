import type { AxiosResponse } from "axios";
import axios from "axios";
import { BaseService } from "../BaseService";
import { StatisticsType } from "@/models/AssessmentModel";
import { type StatisticsByCountry } from "@/models/Common";


export class DocumentVisualizationService extends BaseService {

    async getDocumentStatisticsByCountry(documentId: number, statisticsType: StatisticsType, startDate: string, endDate: string): Promise<AxiosResponse<StatisticsByCountry[]>> {
        return super.sendRequest(axios.get, `visualization-data/document/statistics/${documentId}/${statisticsType}?startDate=${startDate}&endDate=${endDate}`);
    }

    async getMonthlyStatisticsForDocument(documentId: number, statisticsType: StatisticsType, startDate: string, endDate: string): Promise<AxiosResponse<Record<string, number>>> {
        return super.sendRequest(axios.get, `visualization-data/document/monthly-statistics/${documentId}/${statisticsType}?startDate=${startDate}&endDate=${endDate}`);
    }
}

export default new DocumentVisualizationService();
