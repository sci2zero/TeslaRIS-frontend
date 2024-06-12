import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class ImportService extends BaseService {
  
    async startHarvest(dateFrom: Date, dateTo: Date): Promise<AxiosResponse<number>> {
      return super.sendRequest(axios.get, `import-common/documents-by-author?dateFrom=${dateFrom.toISOString().split('T')[0]}&dateTo=${dateTo.toISOString().split('T')[0]}`);
    }

    async getHarvestedDocumentsCound(): Promise<AxiosResponse<number>> {
      return super.sendRequest(axios.get, "load/load-wizard/count-remaining");
    }
  
  }
  
  export default new ImportService();