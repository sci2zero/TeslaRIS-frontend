import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { JournalIndex } from "@/models/JournalModel";

export class JournalService extends BaseService {

  async searchJournals(tokens: string): Promise<AxiosResponse<Page<JournalIndex>>> {
    return super.sendRequest(axios.get, `journal/simple-search?${tokens}`);
  }

  async deleteJournal(journalId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `journal/${journalId}`);
  }
}

export default new JournalService();