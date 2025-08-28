import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CommissionYearlyCounts, MCategoryCounts, StatisticsByCountry, YearlyCounts } from "@/models/Common";
import { BaseService } from "../BaseService";


export class PersonVisualizationService extends BaseService {

    async getPersonPublicationCountsByYear(personId: number): Promise<AxiosResponse<YearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/publication-count/${personId}`);
    }

    async getPersonViewsByCountry(personId: number): Promise<AxiosResponse<StatisticsByCountry[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/statistics/${personId}`);
    }

    async getMonthlyViewsForPerson(personId: number): Promise<AxiosResponse<Record<string, number>>> {
        return super.sendRequest(axios.get, `visualization-data/person/monthly-statistics/${personId}`);
    }

    async getPersonMCategories(personId: number): Promise<AxiosResponse<MCategoryCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/m-category/${personId}`);
    }

    async getPersonMCategoryCounts(personId: number): Promise<AxiosResponse<CommissionYearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/m-category-count/${personId}`);
    }
}

export default new PersonVisualizationService();
