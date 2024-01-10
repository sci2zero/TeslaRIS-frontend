import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class DocumentPublicationService extends BaseService {

  async getDocumentCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "document/count");
  }

  async searchDocumentPublications(tokens: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `document/simple-search?${tokens}`);
  }

  async deleteDocumentPublication(documentPublicationId: number): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.delete, `document/${documentPublicationId}`);
  }
}

export default new DocumentPublicationService();