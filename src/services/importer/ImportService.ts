import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { AuthorCentricInstitutionHarvestRequest, FormatDescription, JournalPublicationLoad, ProceedingsPublicationLoad, RecurrenceType } from "@/models/LoadModel";
import type { OrganisationUnitResponse } from "@/models/OrganisationUnitModel";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";
import type { Page } from "@/models/Common";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import type { ProceedingsResponse } from "@/models/ProceedingsModel";
import type { PersonResponse } from "@/models/PersonModel";
import i18n from "@/i18n";
import { toUtcLocalDateTimeString } from "@/utils/DateUtil";


export class ImportService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();
  
    async canPerformHarvest(): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, "import-common/can-perform");
    }
  
    async startHarvest(dateFrom: string, dateTo: string, institutionId: number = 0): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.get, `import-common/documents-by-author-or-institution?dateFrom=${dateFrom.split("T")[0]}&dateTo=${dateTo.split("T")[0]}&institutionId=${institutionId}`);
    }

    async scheduleHarvest(timestamp: string, recurrence: RecurrenceType, dateFrom: string, dateTo: string, institutionId: number = 0): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.post, `import-common/schedule/documents-by-author-or-institution?dateFrom=${dateFrom.split("T")[0]}&dateTo=${dateTo.split("T")[0]}&institutionId=${institutionId}&timestamp=${toUtcLocalDateTimeString(timestamp)}&recurrence=${recurrence}`);
    }

    async startAuthorCentricInstitutionHarvest(dateFrom: string, dateTo: string, request: AuthorCentricInstitutionHarvestRequest): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `import-common/author-centric-for-institution?dateFrom=${dateFrom.split("T")[0]}&dateTo=${dateTo.split("T")[0]}`, request);
    }

    async scheduleAuthorCentricInstitutionHarvest(timestamp: string, recurrence: RecurrenceType, dateFrom: string, dateTo: string, request: AuthorCentricInstitutionHarvestRequest): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.post, `import-common/author-centric-for-institution?dateFrom=${dateFrom.split("T")[0]}&dateTo=${dateTo.split("T")[0]}&timestamp=${toUtcLocalDateTimeString(timestamp)}&recurrence=${recurrence}`, request);
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

    async skipWizard(institutionId: number | null = null, removeFromRecord: boolean = false): Promise<AxiosResponse<void>> {
          return super.sendRequest(axios.patch, `load/skip?removeFromRecord=${removeFromRecord}${institutionId ? "&institutionId=" + institutionId : ""}`);
    }

    async prepareOldDocumentForOverwriting(oldDocumentId: number, institutionId: number | null = null): Promise<AxiosResponse<void>> {
          return super.sendRequest(axios.patch, `load/prepare-for-overwriting/${oldDocumentId}${institutionId ? "?institutionId=" + institutionId : ""}`);
    }

    async markCurrentAsLoaded(
        institutionId: number | null = null,
        oldDocumentId: number | null = null,
        deleteOldDocument: boolean | null = null,
        newDocumentId: number | null = null
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

        if (newDocumentId !== null) {
            queryParams.push(`newDocumentId=${newDocumentId}`);
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

    async enrichPersonIdentifiers(importId: string, selectedPersonId: number, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<PersonResponse>> {
        return super.sendRequest(axios.patch, `load/person/${importId}/${selectedPersonId}${institutionId ? "?institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async enrichInstitutionIdentifiers(importId: string, selectedInstitutionId: number, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<PersonResponse>> {
        return super.sendRequest(axios.patch, `load/institution/${importId}/${selectedInstitutionId}${institutionId ? "?institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async createNewJournal(eIssn: string, printIssn: string, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<PublicationSeries>> {
        return super.sendRequest(axios.post, `load/journal?eIssn=${eIssn}&printIssn=${printIssn}${institutionId ? "&institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async enrichPublicationSeriesIdentifiers(eIssn: string, printIssn: string, selectedJournalId: number, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<PublicationSeries>> {
        return super.sendRequest(axios.patch, `load/publication-series/${selectedJournalId}?eIssn=${eIssn}&printIssn=${printIssn}${institutionId ? "&institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async enrichConferenceIdentifiers(selectedConferenceId: number, idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<PublicationSeries>> {
        return super.sendRequest(axios.patch, `load/conference/${selectedConferenceId}?${institutionId ? "&institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async createNewProceedings(idempotencyKey: string, institutionId: number | null = null): Promise<AxiosResponse<ProceedingsResponse>> {
        return super.sendRequest(axios.post, `load/proceedings${institutionId ? "?institutionId=" + institutionId : ""}`, {}, idempotencyKey);
    }

    async searchForDuplicates(parameters: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.get, `document/deduplication-search?${parameters}`);
    }

    async getCSVFileFormatDescription(): Promise<AxiosResponse<FormatDescription>> {
        return super.sendRequest(axios.get, `import-common/csv-file-format?language=${i18n.vueI18n.global.locale}`);
    }

    async fetchOAIPMHSources(): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, "oai-harvest/sources");
    }

    async scheduleOAIPMHHarvest(sourceName: string, timestamp: string, recurrence: RecurrenceType, dateFrom: string, dateTo: string): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `oai-harvest/schedule?sourceName=${sourceName}&from=${dateFrom}&until=${dateTo}&timestamp=${toUtcLocalDateTimeString(timestamp)}&recurrence=${recurrence}`);
    }

    async fetchSKGIFSources(): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, "skg-if-harvest/sources");
    }

    async scheduleSKGIFHarvest(sourceName: string, timestamp: string, recurrence: RecurrenceType, dateFrom: string, dateTo: string, authorIdentifier: string, institutionIdentifier: string): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `skg-if-harvest/schedule?sourceName=${sourceName}&from=${dateFrom}&until=${dateTo}&timestamp=${toUtcLocalDateTimeString(timestamp)}&recurrence=${recurrence}&authorIdentifier=${authorIdentifier}&institutionIdentifier=${institutionIdentifier}`);
    }
}
  
export default new ImportService();
