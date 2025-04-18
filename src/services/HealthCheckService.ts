import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";


export class HealthCheckService extends BaseService {

    async performHealthCheck(): Promise<AxiosResponse<any>> {
        return super.sendRequest(axios.get, "health-check");
    }
}

export default new HealthCheckService();
