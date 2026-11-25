import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { LanguageKnowledge, LanguageKnowledgeResponse } from "@/models/PersonModel";

export class LanguageKnowledgeService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async createLanguageKnowledge(body: LanguageKnowledge, personId: number): Promise<AxiosResponse<LanguageKnowledgeResponse>> {
    return super.sendRequest(axios.post, `language-knowledge/${personId}`, body, LanguageKnowledgeService.idempotencyKey);
  }

  async updateLanguageKnowledge(body: LanguageKnowledge, personId: number, languageKnowledgeId: number): Promise<AxiosResponse<LanguageKnowledgeResponse>> {
    return super.sendRequest(axios.put, `language-knowledge/${personId}/${languageKnowledgeId}`, body, LanguageKnowledgeService.idempotencyKey);
  }

  async deleteLanguageKnowledge(personId: number, languageKnowledgeId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `language-knowledge/${personId}/${languageKnowledgeId}`);
  }
}

export default new LanguageKnowledgeService();
