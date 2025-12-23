import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { DeduplicationSuggestion } from "@/models/PublicationModel";
import type { Page } from "@/models/Common";
import type { EntityType } from "@/models/MergeModel";

export class DeduplicationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async fetchDeduplicationSuggestions(page: number, size: number, type: EntityType): Promise<AxiosResponse<Page<DeduplicationSuggestion>>> {
    return super.sendRequest(axios.get, `deduplication/${type}?page=${page}&size=${size}`);
  }

  async getSuggestionId(leftId: number, rightId: number, entityType: EntityType): Promise<AxiosResponse<string | null>> {
    return super.sendRequest(axios.patch, `deduplication/suggestion/${leftId}/${rightId}/${entityType}`);
  }

  async flagAsNotDuplicate(suggestionId: string): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `deduplication/suggestion/${suggestionId}`);
  }

  async deleteSuggestion(suggestionId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `deduplication/suggestion/${suggestionId}`);
  }

  async performDeduplicationScan(): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.post, "deduplication/deduplicate-ahead-of-time", {}, DeduplicationService.idempotencyKey);
  }
}

export default new DeduplicationService();
