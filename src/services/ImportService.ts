import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { JournalPublicationLoad, ProceedingsPublicationLoad } from "@/models/LoadModel";

export class ImportService extends BaseService {
  
    async startHarvest(dateFrom: string, dateTo: string): Promise<AxiosResponse<number>> {
      return super.sendRequest(axios.get, `import-common/documents-by-author?dateFrom=${dateFrom.split("T")[0]}&dateTo=${dateTo.split("T")[0]}`);
    }

    async getHarvestedDocumentsCound(): Promise<AxiosResponse<number>> {
      return super.sendRequest(axios.get, "load/load-wizard/count-remaining");
    }

    async getNextFromWizard(): Promise<AxiosResponse<JournalPublicationLoad | ProceedingsPublicationLoad>> {
      return super.sendRequest(axios.get, "load/load-wizard");
    }

    async skipWizard(): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, "load/skip");
    }
  
  }
  
  export default new ImportService();
