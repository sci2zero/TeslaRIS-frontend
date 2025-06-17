import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { LanguageResponse, LanguageTag, LanguageTagResponse, Page } from "@/models/Common";

export class LanguageService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  private cachedLanguages: AxiosResponse<LanguageResponse[]> | null = null;
  
  private cachedUILanguages: AxiosResponse<LanguageResponse[]> | null = null;
  
  private cachedLanguageTags: AxiosResponse<LanguageTagResponse[]> | null = null;


  async searchLanguageTags(parameters: string): Promise<AxiosResponse<Page<LanguageTagResponse>>> {
    return super.sendRequest(axios.get, `language/tags/search?${parameters}`);
  }

  async getAllLanguages(): Promise<AxiosResponse<LanguageResponse[]>> {
    if (this.cachedLanguages) {
      return Promise.resolve(this.cachedLanguages);
    }

    const response = await super.sendRequest(axios.get, "language");

    this.cachedLanguages = response;

    return response;
  }

  async getAllUILanguages(): Promise<AxiosResponse<LanguageResponse[]>> {
    if (this.cachedUILanguages) {
      return Promise.resolve(this.cachedUILanguages);
    }

    const response = await super.sendRequest(axios.get, "language/ui-languages");

    this.cachedUILanguages = response;

    return response;
  }

  async getAllLanguageTags(): Promise<AxiosResponse<LanguageTagResponse[]>> {
    if (this.cachedLanguageTags) {
      return Promise.resolve(this.cachedLanguageTags);
    }

    const response = await super.sendRequest(axios.get, "language/tags");

    this.cachedLanguageTags = response;

    return response;
  }

  async createLanguageTag(body: LanguageTag): Promise<AxiosResponse<LanguageTagResponse>> {
    return super.sendRequest(axios.post, "language/tag", body, LanguageService.idempotencyKey);
  }

  async updateLanguageTag(languageTagId: number, body: LanguageTag): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `language/tag/${languageTagId}`, body);
  }

  async deleteLanguageTag(languageTagId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `language/tag/${languageTagId}`);
  }

  invalidateLanguageTagCaches(): void {
    this.cachedLanguageTags = null;
  }

  invalidateLanguageCaches(): void {
    this.cachedLanguages = null;
  }
}

export default new LanguageService();