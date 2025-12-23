import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { MaintenanceInformation } from "@/models/Common";


export class ApplicationConfigurationService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async scheduleMaintenence(timestamp: string, approximateEndMoment: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `app-configuration/maintenance/schedule?timestamp=${timestamp}&approximateEndMoment=${approximateEndMoment}`, {}, ApplicationConfigurationService.idempotencyKey);
    }

    async getIsApplicationInMaintenanceMode(): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, "app-configuration/maintenance/check");
    }

    async getNextScheduledMaintenance(): Promise<AxiosResponse<MaintenanceInformation>> {
        return super.sendRequest(axios.get, "app-configuration/maintenance/next");
    }

    async turnOnMaintenanceMode(): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, "app-configuration/maintenance/turn-on");
    }

    async turnOffMaintenanceMode(): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, "app-configuration/maintenance/turn-off");
    }
}

export default new ApplicationConfigurationService();
