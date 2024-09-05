import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { DocumentDeduplicationSuggestion } from "@/models/PublicationModel";
import type { Page } from "@/models/Common";

export class DeduplicationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async fetchDocumentSuggestions(page: number, size: number): Promise<AxiosResponse<Page<DocumentDeduplicationSuggestion>>> {
    return super.sendRequest(axios.get, `deduplication/documents?page=${page}&size=${size}`);
  }

  async flagDocumentAsNotDuplicate(suggestionId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `deduplication/document/${suggestionId}`);
  }

  async deleteDocumentSuggestion(suggestionId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `deduplication/document/${suggestionId}`);
  }

  async performDeduplicationScan(): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.post, "deduplication/deduplicate-ahead-of-time", {}, DeduplicationService.idempotencyKey);
  }
}

export default new DeduplicationService();
