import type { AxiosResponse } from "axios";
import axios from "axios";
import type { YearlyCounts } from "@/models/Common";
import { BaseService } from "../BaseService";
import { type StatisticsType } from "@/models/AssessmentModel";
import { type ThesisType } from "@/models/PublicationModel";


export class DigitalLibraryVisualizationService extends BaseService {

    async getOrganisationUnitThesisCountsByYear(organisationUnitId: number, allowedThesisTypes: ThesisType[], from: number | null = null, to: number | null = null): Promise<AxiosResponse<YearlyCounts[]>> {
        const allowedTypesParam = this.createAllowedTypesParam(allowedThesisTypes);

        return super.sendRequest(axios.get, `visualization-data/digital-library/thesis-count/${organisationUnitId}?from=${from ?? ''}&to=${to ?? ''}${allowedTypesParam}`);
    }

    async getMonthlyStatisticsForDigitalLibrary(organisationUnitId: number, startDate: string, endDate: string, statisticsType: StatisticsType, allowedThesisTypes: ThesisType[]): Promise<AxiosResponse<Record<string, number>>> {
        const allowedTypesParam = this.createAllowedTypesParam(allowedThesisTypes);

        return super.sendRequest(axios.get, `visualization-data/digital-library/monthly-statistics/${organisationUnitId}?from=${startDate}&to=${endDate}&statisticsType=${statisticsType}${allowedTypesParam}`);
    }

    createAllowedTypesParam(allowedTypes: ThesisType[]): string {
        let allowedTypesParam = "";
        allowedTypes.forEach(allowedType => {
            allowedTypesParam += `&allowedThesisTypes=${allowedType}`;
        });

        return allowedTypesParam;
    }
}

export default new DigitalLibraryVisualizationService();
