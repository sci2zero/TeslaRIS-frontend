import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { DocumentPublicationIndex, JournalPublication } from "@/models/PublicationModel";

export class DocumentPublicationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getDocumentCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "document/count");
  }

  async searchDocumentPublications(tokens: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/simple-search?${tokens}`);
  }

  async findMyPublicationsInJournal(journalId: number): Promise<AxiosResponse<DocumentPublicationIndex[]>> {
    return super.sendRequest(axios.get, `journal-publication/journal/${journalId}/my-publications`);
  }

  async createJournalPublication(body: JournalPublication): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, "journal-publication", body, DocumentPublicationService.idempotencyKey);
  }

  async deleteDocumentPublication(documentPublicationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `document/${documentPublicationId}`);
  }
}

export default new DocumentPublicationService();