import axios, { type AxiosResponse } from "axios";
import {BaseService} from "./BaseService";
import type { MergedConferences, MergedDatasets, MergedJournals, MergedPatents, MergedPersons, MergedProceedings, MergedProceedingsPublications, MergedSoftware } from "@/models/MergeModel";

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
      return super.sendRequest(axios.patch, `merge/person/involvements/source/${sourcePersonId}/target/${targetPersonId}`, {entityIds: involvementIds});
    }

    async switchPrizesToOtherPerson(prizeIds: number[], sourcePersonId: number, targetPersonId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/person/prizes/source/${sourcePersonId}/target/${targetPersonId}`, {entityIds: prizeIds});
    }

    async switchSkillsToOtherPerson(skillIds: number[], sourcePersonId: number, targetPersonId: number): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/person/skills/source/${sourcePersonId}/target/${targetPersonId}`, {entityIds: skillIds});
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

    async saveMergedProceedingsMetadata(leftProceedingsId: number, rightProceedingsId: number, body: MergedProceedings): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/proceedings/metadata/${leftProceedingsId}/${rightProceedingsId}`, body);
    }

    async saveMergedPersonsMetadata(leftPersonId: number, rightPersonId: number, body: MergedPersons): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/person/metadata/${leftPersonId}/${rightPersonId}`, body);
    }

    async saveMergedConferencesMetadata(leftConferenceId: number, rightConferenceId: number, body: MergedConferences): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/conference/metadata/${leftConferenceId}/${rightConferenceId}`, body);
    }

    async saveMergedJournalsMetadata(leftJournalId: number, rightJournalId: number, body: MergedJournals): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/journal/metadata/${leftJournalId}/${rightJournalId}`, body);
    }

    async saveMergedSoftwareMetadata(leftSoftwareId: number, rightSoftwareId: number, body: MergedSoftware): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/software/metadata/${leftSoftwareId}/${rightSoftwareId}`, body);
    }

    async saveMergedDatasetsMetadata(leftDatasetId: number, rightDatasetId: number, body: MergedDatasets): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/dataset/metadata/${leftDatasetId}/${rightDatasetId}`, body);
    }

    async saveMergedPatentsMetadata(leftPatentId: number, rightPatentId: number, body: MergedPatents): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/patent/metadata/${leftPatentId}/${rightPatentId}`, body);
    }

    async saveMergedProceedingsPublicationMetadata(leftProceedingsPublicationId: number, rightProceedingsPublicationId: number, body: MergedProceedingsPublications): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.patch, `merge/proceedings-publication/metadata/${leftProceedingsPublicationId}/${rightProceedingsPublicationId}`, body);
    }
  }
  
  export default new MergeService();
  