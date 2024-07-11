import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { Conference, EventIndex, EventsRelation } from "@/models/EventModel";

export class EventService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async searchConferences(tokens: string, returnOnlyNonSerialEvents: boolean): Promise<AxiosResponse<Page<EventIndex>>> {
    return super.sendRequest(axios.get, `conference/simple-search?${tokens}&returnOnlyNonSerialEvents=${returnOnlyNonSerialEvents}`);
  }

  async searchConferencesForImport(parameters: string): Promise<AxiosResponse<Page<EventIndex>>> {
    return super.sendRequest(axios.get, `conference/import-search?${parameters}`);
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

  async getRelationsForOneTimeEvent(eventId: number): Promise<AxiosResponse<EventsRelation[]>> {
    return super.sendRequest(axios.get, `events-relation/${eventId}`);
  }

  async getRelationsForSerialEvent(serialEventId: number): Promise<AxiosResponse<EventsRelation[]>> {
    return super.sendRequest(axios.get, `events-relation/serial-event/${serialEventId}`);
  }

  async deleteEventsRelation(relationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `events-relation/${relationId}`);
  }
}

export default new EventService();