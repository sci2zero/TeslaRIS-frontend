import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class JournalService extends BaseService {

  async searchJournals(tokens: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `journal/simple-search?${tokens}`);
  }

  async deleteJournal(conferenceId: number): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.delete, `journal/${conferenceId}`);
  }
}

export default new JournalService();