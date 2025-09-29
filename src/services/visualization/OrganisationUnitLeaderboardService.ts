import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CommissionAssessmentPointsPersonLeaderboard, LeaderboardEntry } from "@/models/Common";
import { BaseService } from "../BaseService";


export class OrganisationUnitLeaderboardService extends BaseService {

    async getOrganisationUnitPublicationCountLeaderboard(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/organisation-unit/publications?institutionId=${institutionId}&yearFrom=${from ?? ''}&yearTo=${to ?? ''}`);
    }

    async getOrganisationUnitCitationCountLeaderboard(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<LeaderboardEntry[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/organisation-unit/citations?institutionId=${institutionId}&yearFrom=${from ?? ''}&yearTo=${to ?? ''}`);
    }

    async getOrganisationUnitAssessmentPointsLeaderboard(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<CommissionAssessmentPointsPersonLeaderboard[]>> {
        return super.sendRequest(axios.get, `leaderboard-data/organisation-unit/assessment-points?institutionId=${institutionId}&yearFrom=${from ?? ''}&yearTo=${to ?? ''}`);
    }
}

export default new OrganisationUnitLeaderboardService();