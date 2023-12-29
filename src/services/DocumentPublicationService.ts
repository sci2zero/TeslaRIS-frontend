import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class DocumentPublicationService extends BaseService {

  async getOUCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "document/count");
  }
}

export default new DocumentPublicationService();