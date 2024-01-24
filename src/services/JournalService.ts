import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { Journal, JournalIndex } from "@/models/JournalModel";

export class JournalService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async searchJournals(tokens: string): Promise<AxiosResponse<Page<JournalIndex>>> {
    return super.sendRequest(axios.get, `journal/simple-search?${tokens}`);
  }

  async createJournal(body: Journal): Promise<AxiosResponse<Journal>> {
    return super.sendRequest(axios.post, "journal", body, JournalService.idempotencyKey);
  }

  async deleteJournal(journalId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `journal/${journalId}`);
  }
}

export default new JournalService();