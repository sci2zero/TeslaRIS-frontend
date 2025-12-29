import axios, { type AxiosResponse } from "axios";
import { BaseService } from "./BaseService";


export class PublicationTypeTransferService extends BaseService {

    async transferProceedingsPublicationToJournal(documentId: number, journalId: number): Promise<AxiosResponse<number>> {
      return super.sendRequest(axios.patch, `journal-publication/transfer/${documentId}/${journalId}`, {});
    }

    async transferJournalPublicationToProceedings(documentId: number, proceedingsId: number): Promise<AxiosResponse<number>> {
      return super.sendRequest(axios.patch, `proceedings-publication/transfer/${documentId}/${proceedingsId}`, {});
    }
}

export default new PublicationTypeTransferService();