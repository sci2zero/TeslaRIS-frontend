import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { Conference, EventIndex } from "@/models/EventModel";

export class EventService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async searchConferences(tokens: string): Promise<AxiosResponse<Page<EventIndex>>> {
    return super.sendRequest(axios.get, `conference/simple-search?${tokens}`);
  }

  async readConference(conferenceId: number): Promise<AxiosResponse<Conference>> {
    return super.sendRequest(axios.get, `conference/${conferenceId}`);
  }

  async deleteConference(conferenceId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `conference/${conferenceId}`);
  }

  async createConference(body: Conference): Promise<AxiosResponse<Conference>> {
    return super.sendRequest(axios.post, "conference", body, EventService.idempotencyKey);
  }

  async updateConference(conferenceId: number, updatedConference: Conference): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `conference/${conferenceId}`, updatedConference);
  }

  async canEdit(conferenceId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `conference/${conferenceId}/can-edit`);
  }

  async reorderContribution(conferenceId: number, contributionId: number, oldOrderNumber: number, newOrderNumber: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `conference/${conferenceId}/reorder-contribution/${contributionId}`, {oldContributionOrderNumber: oldOrderNumber, newContributionOrderNumber: newOrderNumber});
  }
}

export default new EventService();