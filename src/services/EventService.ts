import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { EventIndex } from "@/models/EventModel";

export class EventService extends BaseService {

  async searchConferences(tokens: string): Promise<AxiosResponse<Page<EventIndex>>> {
    return super.sendRequest(axios.get, `conference/simple-search?${tokens}`);
  }

  async deleteConference(conferenceId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `conference/${conferenceId}`);
  }
}

export default new EventService();