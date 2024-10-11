import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class StatisticsService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

  async registerPersonView(personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, `statistics/person/${personId}`, {}, StatisticsService.idempotencyKey);
  }

  async registerOUView(organisationUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, `statistics/organisation-unit/${organisationUnitId}`, {}, StatisticsService.idempotencyKey);
  }

  async registerDocumentView(documentId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, `statistics/document/${documentId}`, {}, StatisticsService.idempotencyKey);
  }
}

export default new StatisticsService();
