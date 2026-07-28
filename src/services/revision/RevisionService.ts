import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";


export class RevisionService extends BaseService {

  async getRevisionHistory(entityType: string, entityId: number): Promise<AxiosResponse<string[]>> {
    return super.sendRequest(axios.get, `revision/${entityType}/${entityId}`);
  }

  async getRevisionAtDate(entityType: string, entityId: number, timestamp: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `revision/${entityType}/${entityId}/at?timestamp=${timestamp}`);
  }
}

export default new RevisionService();
