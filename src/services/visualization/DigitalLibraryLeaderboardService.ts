import type { AxiosResponse } from "axios";
import axios from "axios";
import type { LeaderboardEntry } from "@/models/Common";
import { BaseService } from "../BaseService";
import { StatisticsType } from "@/models/AssessmentModel";
import { type ThesisType } from "@/models/PublicationModel";


export class DigitalLibraryLeaderboardService extends BaseService {

    async getThesisStatisticCountLeaderboard(institutionId: number, startDate: string | null = null, endDate: string | null = null, statisticsType: StatisticsType, allowedTypes: ThesisType[]): Promise<AxiosResponse<LeaderboardEntry[]>> {
        let allowedTypesParam = "";
        allowedTypes.forEach(allowedType => {
            allowedTypesParam += `&allowedThesisTypes=${allowedType}`;
        });

        return super.sendRequest(axios.get, `leaderboard-data/digital-library/statistics?institutionId=${institutionId}&from=${startDate ?? ''}&to=${endDate ?? ''}&statisticsType=${statisticsType}${allowedTypesParam}`);
    }
}

export default new DigitalLibraryLeaderboardService();
