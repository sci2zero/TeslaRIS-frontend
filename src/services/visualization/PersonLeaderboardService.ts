import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CommissionAssessmentPointsPersonLeaderboard, LeaderboardEntry } from "@/models/Common";
import { BaseService } from "../BaseService";


export class PersonLeaderboardService extends BaseService {

    async getPersonPublicationCountLeaderboard(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/person/publications?institutionId=${institutionId}&yearFrom=${from ?? ''}&yearTo=${to ?? ''}`);
    }

    async getPersonCitationCountLeaderboard(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/person/citations?institutionId=${institutionId}&yearFrom=${from ?? ''}&yearTo=${to ?? ''}`);
    }

    async getPersonAssessmentPointsLeaderboard(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<CommissionAssessmentPointsPersonLeaderboard[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/person/assessment-points?institutionId=${institutionId}&yearFrom=${from ?? ''}&yearTo=${to ?? ''}`);
    }

    async getPersonViewCountLeaderboard(institutionId: number, startDate: string | null = null, endDate: string | null = null): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/person/views?institutionId=${institutionId}&from=${startDate ?? ''}&to=${endDate ?? ''}`);
    }
}

export default new PersonLeaderboardService();
