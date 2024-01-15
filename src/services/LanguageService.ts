import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { LanguageResponse } from "@/models/Common";

export class LanguageService extends BaseService {

  async getAllLanguages(): Promise<AxiosResponse<LanguageResponse[]>> {
    return super.sendRequest(axios.get, "language");
  }
}

export default new LanguageService();