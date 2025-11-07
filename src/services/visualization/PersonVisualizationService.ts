import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CommissionYearlyCounts, MCategoryCounts, PersonFeaturedInformation, StatisticsByCountry, YearlyCounts, YearRange } from "@/models/Common";
import { BaseService } from "../BaseService";
import { DocumentContributionType } from "@/models/PublicationModel";


export class PersonVisualizationService extends BaseService {

    async getPersonPublicationCountsByYear(personId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<YearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/publication-count/${personId}?from=${from ?? ''}&to=${to ?? ''}`);
    }

    async getPersoncitationCountsByYear(personId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<Record<number, number>>> {
        return super.sendRequest(axios.get, `visualization-data/person/yearly-citations/${personId}?from=${from ?? ''}&to=${to ?? ''}`);
    }

    async getPersonMCategories(personId: number, from: number, to: number): Promise<AxiosResponse<MCategoryCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/m-category/${personId}?from=${from}&to=${to}`);
    }

    async getPersonMCategoryCounts(personId: number, from: number, to: number): Promise<AxiosResponse<CommissionYearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/m-category-count/${personId}?from=${from}&to=${to}`);
    }

    async getPersonViewsByCountry(personId: number, startDate: string, endDate: string): Promise<AxiosResponse<StatisticsByCountry[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/statistics/${personId}?startDate=${startDate}&endDate=${endDate}`);
    }

    async getMonthlyViewsForPerson(personId: number, startDate: string, endDate: string): Promise<AxiosResponse<Record<string, number>>> {
        return super.sendRequest(axios.get, `visualization-data/person/monthly-statistics/${personId}?startDate=${startDate}&endDate=${endDate}`);
    }

    async getFeaturedInformationForPerson(personId: number): Promise<AxiosResponse<PersonFeaturedInformation>> {
        return super.sendRequest(axios.get, `visualization-data/person/featured/${personId}`);
    }

    async getMinAndMaxYearForFiltering(personId: number, contributionTypes: DocumentContributionType[]): Promise<AxiosResponse<YearRange>> {
        let contributionTypesParam = "";
        contributionTypes.forEach(contributionType => {
            contributionTypesParam += `&contributionTypes=${contributionType}`;
        });
        contributionTypesParam = contributionTypesParam.slice(1);

        return super.sendRequest(axios.get, `visualization-data/person/year-range/${personId}?${contributionTypesParam}`);
    }
}

export default new PersonVisualizationService();
