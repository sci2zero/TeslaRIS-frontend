import type { AxiosResponse } from "axios";
import axios from "axios";
import type { StatisticsByCountry, YearlyCounts } from "@/models/Common";
import { BaseService } from "../BaseService";
import { StatisticsType } from "@/models/AssessmentModel";


export class PersonVisualizationService extends BaseService {

    async getPersonPublicationCountsByYear(personId: number): Promise<AxiosResponse<YearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/publication-count/${personId}`);
    }

    async getPersonStatisticsByCountry(personId: number, type: StatisticsType): Promise<AxiosResponse<StatisticsByCountry[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/statistics/${type}/${personId}`);
    }
}

export default new PersonVisualizationService();
