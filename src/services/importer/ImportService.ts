import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { JournalPublicationLoad, ProceedingsPublicationLoad } from "@/models/LoadModel";
import type { OrganisationUnitResponse } from "@/models/OrganisationUnitModel";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";
import type { Page } from "@/models/Common";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import type { ProceedingsResponse } from "@/models/ProceedingsModel";
import type { PersonResponse } from "@/models/PersonModel";


export class ImportService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();
  
    async canPerformHarvest(): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, "import-common/can-perform");
    }
  
    async startHarvest(dateFrom: string, dateTo: string, institutionId: number = 0): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.get, `import-common/documents-by-author-or-institution?dateFrom=${dateFrom.split("T")[0]}&dateTo=${dateTo.split("T")[0]}&institutionId=${institutionId}`);
    }

    async uploadBibiographicFiles(files: File[]): Promise<AxiosResponse<number>> {
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
                "Idempotency-Key": ImportService.idempotencyKey,
            },
            withCredentials: true,
        };

        return axios.post(`${this.basePath}import-common/documents-from-file`, formData, config);
    }


    async getHarvestedDocumentsCount(institutionId: number | null = null): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.get, `load/load-wizard/count-remaining${institutionId ? "?institutionId=" + institutionId : ""}`);
    }

    async getNextFromWizard(institutionId: number | null = null): Promise<AxiosResponse<JournalPublicationLoad | ProceedingsPublicationLoad>> {
        return super.sendRequest(axios.get, `load/load-wizard${institutionId ? "?institutionId=" + institutionId : ""}`);
    }

    async skipWizard(institutionId: number | null = null): Promise<AxiosResponse<void>> {
          return super.sendRequest(axios.patch, `load/skip${institutionId ? "?institutionId=" + institutionId : ""}`);
    }

    async markCurrentAsLoaded(
        institutionId: number | null = null,
        oldDocumentId: number | null = null,
        deleteOldDocument: boolean | null = null
    ): Promise<AxiosResponse<void>> {
        const queryParams: string[] = [];

        if (institutionId !== null) {
            queryParams.push(`institutionId=${institutionId}`);
        }

        if (oldDocumentId !== null) {
            queryParams.push(`oldDocumentId=${oldDocumentId}`);
        }

        if (deleteOldDocument !== null) {
            queryParams.push(`deleteOldDocument=${deleteOldDocument}`);
        }

        const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

        return super.sendRequest(axios.patch, `load/mark-as-loaded${queryString}`);
    }

    async createNewInstitution(importId: string, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<OrganisationUnitResponse>> {
        return super.sendRequest(axios.post, `load/institution/${importId}${institutionId ? "?institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async createNewPerson(importId: string, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<PersonResponse>> {
        return super.sendRequest(axios.post, `load/person/${importId}${institutionId ? "?institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async createNewJournal(eIssn: string, printIssn: string, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<PublicationSeries>> {
        return super.sendRequest(axios.post, `load/journal?eIssn=${eIssn}&printIssn=${printIssn}${institutionId ? "&institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async createNewProceedings(idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<ProceedingsResponse>> {
        return super.sendRequest(axios.post, `load/proceedings${institutionId ? "?institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async searchForDuplicates(parameters: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.get, `document/deduplication-search?${parameters}`);
    }
}
  
export default new ImportService();
