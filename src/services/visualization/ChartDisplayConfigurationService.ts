import type { AxiosResponse } from "axios";
import axios from "axios";
import { BaseService } from "../BaseService";
import { type FullChartDisplaySettings } from "@/models/ChartDisplayConfigurationModel";


export class ChartDisplayConfigurationService extends BaseService {

    async getFullChartDisplaySettings(organisationUnitId: number): Promise<AxiosResponse<FullChartDisplaySettings>> {
        return super.sendRequest(axios.get, `chart-display-configuration/base/${organisationUnitId}`);
    }
}

export default new ChartDisplayConfigurationService();
