import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { Revision } from "@/models/RevisionModel";


export class RevisionService extends BaseService {

  async getRevisionHistory(entityType: string, entityId: number): Promise<AxiosResponse<Revision[]>> {
    return super.sendRequest(axios.get, `revision/${entityType}/${entityId}`);
  }

  async getRevisionAtDate(entityType: string, entityId: number, timestamp: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `revision/${entityType}/${entityId}/at?timestamp=${timestamp}`);
  }

  async restoreRevision(entityType: string, entityId: number, majorVersion: number, minorVersion: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `revision/${entityType}/${entityId}/restore/${majorVersion}/${minorVersion}`);
  }
}

export default new RevisionService();
