import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { LanguageResponse, LanguageTagResponse } from "@/models/Common";

export class LanguageService extends BaseService {

  private cachedLanguages: AxiosResponse<LanguageResponse[]> | null = null;
  
  private cachedLanguageTags: AxiosResponse<LanguageTagResponse[]> | null = null;

  async getAllLanguages(): Promise<AxiosResponse<LanguageResponse[]>> {
    if (this.cachedLanguages) {
      return Promise.resolve(this.cachedLanguages);
    }

    const response = await super.sendRequest(axios.get, "language");

    this.cachedLanguages = response;

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
}

export default new LanguageService();