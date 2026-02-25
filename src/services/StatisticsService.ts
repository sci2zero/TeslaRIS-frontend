import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import { StatisticsType } from "@/models/AssessmentModel";

export class StatisticsService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async registerPersonView(personId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.post, `statistics/person/${personId}`, {}, StatisticsService.idempotencyKey);
    }

    async registerOUView(organisationUnitId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.post, `statistics/organisation-unit/${organisationUnitId}`, {}, StatisticsService.idempotencyKey);
    }

    async registerDocumentView(documentId: number): Promise<AxiosResponse<void>> {
      if (isNaN(documentId) || documentId <= 0) {
        return Promise.resolve(undefined as unknown as AxiosResponse<void>);
      }

      return super.sendRequest(axios.post, `statistics/document/${documentId}`, {}, StatisticsService.idempotencyKey);
    }

    async registerPublicationSeriesView(publicationSeriesId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.post, `statistics/publication-series/${publicationSeriesId}`, {}, StatisticsService.idempotencyKey);
    }

    async registerEventView(eventId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.post, `statistics/event/${eventId}`, {}, StatisticsService.idempotencyKey);
    }

    async fetchStatisticsTypeIndicators(statisticsType: StatisticsType | string): Promise<AxiosResponse<string[]>> {
      return super.sendRequest(axios.get, `statistics/${statisticsType}`);
    }
}

export default new StatisticsService();
