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

    async switchPublicationToOtherPerson(sourcePersonId: number, targetPersonId: number, publicationId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/person/${sourcePersonId}/target/${targetPersonId}/publication/${publicationId}`);
    }

    async switchAllPublicationsToOtherPerson(sourcePersonId: number, targetPersonId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/person/source/${sourcePersonId}/target/${targetPersonId}`);
    }

    async switchInvolvementsToOtherPerson(involvementIds: number[], sourcePersonId: number, targetPersonId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `involvement/merge/person/source/${sourcePersonId}/target/${targetPersonId}`, {entityIds: involvementIds});
    }

    async switchPrizesToOtherPerson(prizeIds: number[], sourcePersonId: number, targetPersonId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `prize/merge/person/source/${sourcePersonId}/target/${targetPersonId}`, {entityIds: prizeIds});
    }

    async switchSkillsToOtherPerson(skillIds: number[], sourcePersonId: number, targetPersonId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `expertise-or-skill/merge/person/source/${sourcePersonId}/target/${targetPersonId}`, {entityIds: skillIds});
    }

    async switchEmployemntToOtherOU(sourceOUId: number, targetOUId: number, personId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/employment/${sourceOUId}/target/${targetOUId}/person/${personId}`);
    }

    async switchAllEmploymentsToOtherOU(sourceOUId: number, targetOUId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/employment/${sourceOUId}/target/${targetOUId}`);
    }

    async switchProceedingsToOtherConference(targetConferenceId: number, proceedingsId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/conference/${targetConferenceId}/proceedings/${proceedingsId}`);
    }

    async switchAllProceedingsToOtherConference(sourceConferenceId: number, targetConferenceId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/conference/${sourceConferenceId}/target/${targetConferenceId}`);
    }

    async switchProceedingsPublicationToOtherProceedings(targetProceedingsId: number, publicationId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/proceedings/${targetProceedingsId}/publication/${publicationId}`);
    }

    async switchAllProceedingsPublicationsToOtherProceedings(sourceProceedingsId: number, targetProceedingsId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/proceedings/${sourceProceedingsId}/target/${targetProceedingsId}`);
    }

  }
  
  export default new MergeService();