import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class StatisticsService extends BaseService {

  async registerPersonView(personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, `statistics/person/${personId}`);
  }

  async registerOUView(organisationUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, `statistics/organisation-unit/${organisationUnitId}`);
  }

  async registerDocumentView(documentId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, `statistics/document/${documentId}`);
  }
}

export default new StatisticsService();
