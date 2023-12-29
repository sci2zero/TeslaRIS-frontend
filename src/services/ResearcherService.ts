import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class ResearcherService extends BaseService {

  async getOUCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "person/count");
  }
}

export default new ResearcherService();