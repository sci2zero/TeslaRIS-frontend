import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { JournalPublicationLoad, ProceedingsPublicationLoad } from "@/models/LoadModel";
import type { OrganisationUnitResponse } from "@/models/OrganisationUnitModel";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";
import type { Page } from "@/models/Common";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";

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

    async markCurrentAsLoaded(): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, "load/mark-as-loaded");
    }

    async createNewInstitution(scopusAfid: string, idempotencyKey: string): Promise<AxiosResponse<OrganisationUnitResponse>> {
      return super.sendRequest(axios.post, `load/institution/${scopusAfid}`, {}, idempotencyKey);
    }

    async createNewJournal(eIssn: string, printIssn: string, idempotencyKey: string): Promise<AxiosResponse<PublicationSeries>> {
      return super.sendRequest(axios.post, `load/journal?eIssn=${eIssn}&printIssn=${printIssn}`, {}, idempotencyKey);
    }

    async searchForDuplicates(parameters: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
      return super.sendRequest(axios.get, `document/deduplication-search?${parameters}`);
    }
  }
  
  export default new ImportService();
