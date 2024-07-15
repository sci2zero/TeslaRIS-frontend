import axios, { type AxiosResponse } from "axios";
import {BaseService} from "./BaseService";

export class MergeService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();
  
    async switchJournalPublicationToOtherJournal(sourceJournalId: number, publicationId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/journal/${sourceJournalId}/publication/${publicationId}`);
    }

    async switchAllPublicationsToOtherJournal(sourceJournalId: number, targetJournalId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/journal/source/${sourceJournalId}/target/${targetJournalId}`);
      }

  }
  
  export default new MergeService();