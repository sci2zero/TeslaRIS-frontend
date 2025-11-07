import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CommissionYearlyCounts, MCategoryCounts, StatisticsByCountry, YearlyCounts } from "@/models/Common";
import { BaseService } from "../BaseService";


export class OrganisationUnitVisualizationService extends BaseService {

    async getOrganisationUnitPublicationCountsByYear(organisationUnitId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<YearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/organisation-unit/publication-count/${organisationUnitId}?from=${from ?? ''}&to=${to ?? ''}`);
    }

    async getOrganisationUnitMCategories(organisationUnitId: number, from: number, to: number): Promise<AxiosResponse<MCategoryCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/organisation-unit/m-category/${organisationUnitId}?from=${from}&to=${to}`);
    }

    async getOrganisationUnitMCategoryCounts(organisationUnitId: number, from: number, to: number): Promise<AxiosResponse<CommissionYearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/organisation-unit/m-category-count/${organisationUnitId}?from=${from}&to=${to}`);
    }

    async getOrganisationUnitViewsByCountry(organisationUnitId: number, startDate: string, endDate: string): Promise<AxiosResponse<StatisticsByCountry[]>> {
        return super.sendRequest(axios.get, `visualization-data/organisation-unit/statistics/${organisationUnitId}?startDate=${startDate}&endDate=${endDate}`);
    }

    async getMonthlyViewsForOrganisationUnit(organisationUnitId: number, startDate: string, endDate: string): Promise<AxiosResponse<Record<string, number>>> {
        return super.sendRequest(axios.get, `visualization-data/organisation-unit/monthly-statistics/${organisationUnitId}?startDate=${startDate}&endDate=${endDate}`);
    }

    async getOrganisationUnitCitationCountsByYear(institutionId: number, from: number | null = null, to: number | null = null): Promise<AxiosResponse<Record<number, number>>> {
        return super.sendRequest(axios.get, `visualization-data/organisation-unit/yearly-citations/${institutionId}?from=${from ?? ''}&to=${to ?? ''}`);
    }
}

export default new OrganisationUnitVisualizationService();
