import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class EventService extends BaseService {

  async searchConferences(tokens: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `conference/simple-search?${tokens}`);
  }

  async deleteConference(conferenceId: number): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.delete, `conference/${conferenceId}`);
  }
}

export default new EventService();