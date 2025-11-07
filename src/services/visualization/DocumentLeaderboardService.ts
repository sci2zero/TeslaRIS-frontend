import type { AxiosResponse } from "axios";
import axios from "axios";
import type { LeaderboardEntry } from "@/models/Common";
import { BaseService } from "../BaseService";
import { StatisticsType } from "@/models/AssessmentModel";


export class DocumentLeaderboardService extends BaseService {

    async getDocumentCitationCountLeaderboard(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/document/citations?institutionId=${institutionId}&yearFrom=${from ?? ''}&yearTo=${to ?? ''}`);
    }

    async getDocumentStatisticCountLeaderboard(institutionId: number, startDate: string | null = null, endDate: string | null = null, statisticsType: StatisticsType): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/document/statistics?institutionId=${institutionId}&from=${startDate ?? ''}&to=${endDate ?? ''}&statisticsType=${statisticsType}`);
    }
}

export default new DocumentLeaderboardService();
