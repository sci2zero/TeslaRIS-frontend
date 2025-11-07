import type { AxiosResponse } from "axios";
import axios from "axios";
import type { LeaderboardEntry } from "@/models/Common";
import { BaseService } from "../BaseService";


export class GlobalLeaderboardService extends BaseService {

    async getTopCitedResearchersLeaderboard(): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, "leaderboard-data/global/person-citations");
    }

    async getTopCitedInstitutionsLeaderboard(): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, "leaderboard-data/global/organisation-unit-citations");
    }

    async getTopCitedDocumentsLeaderboard(): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, "leaderboard-data/global/document-citations");
    }
}

export default new GlobalLeaderboardService();