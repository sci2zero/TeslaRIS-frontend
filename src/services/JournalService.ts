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

  async readJournal(journalId: number): Promise<AxiosResponse<Journal>> {
    return super.sendRequest(axios.get, `journal/${journalId}`);
  }

  async findJournalByIssn(eIssn: string, printIssn: string): Promise<AxiosResponse<JournalIndex>> {
    return super.sendRequest(axios.get, `journal/issn?eIssn=${eIssn}&printIssn=${printIssn}`);
  }

  async createJournal(body: Journal): Promise<AxiosResponse<Journal>> {
    return super.sendRequest(axios.post, "journal", body, JournalService.idempotencyKey);
  }

  async updateJournal(journalId: number, updatedJournal: Journal): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `journal/${journalId}`, updatedJournal);
  }

  async deleteJournal(journalId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `journal/${journalId}`);
  }

  async forceDeleteJournal(journalId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `journal/force/${journalId}`);
  }

  async canEdit(journalId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `journal/${journalId}/can-edit`);
  }

  async canClassify(journalId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `journal/${journalId}/can-classify`);
  }
}

export default new JournalService();