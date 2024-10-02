import axios, { type AxiosResponse } from "axios";
import {BaseService} from "./BaseService";
import type { MergedBookSeries, MergedConferences, MergedDatasets, MergedJournalPublications, MergedJournals, MergedMonographPublications, MergedMonographs, MergedOrganisationUnits, MergedPatents, MergedPersons, MergedProceedings, MergedProceedingsPublications, MergedSoftware, MergedTheses } from "@/models/MergeModel";

export class MergeService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async switchJournalPublicationToOtherJournal(sourceJournalId: number, publicationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/journal/${sourceJournalId}/publication/${publicationId}`);
    }

    async switchAllPublicationsToOtherJournal(sourceJournalId: number, targetJournalId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/journal/source/${sourceJournalId}/target/${targetJournalId}`);
    }

    async switchPublicationToOtherBookSeries(sourceBookSeriesId: number, publicationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/book-series/${sourceBookSeriesId}/publication/${publicationId}`);
    }

    async switchAllPublicationsToOtherBookSeries(sourceBookSeriesId: number, targetBookSeriesId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/book-series/source/${sourceBookSeriesId}/target/${targetBookSeriesId}`);
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

    async switchMonographPublicationToOtherMonograph(sourceMonographId: number, publicationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/monograph/${sourceMonographId}/publication/${publicationId}`);
    }

    async switchAllPublicationsToOtherMonograph(sourceMonographId: number, targetMonographId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/monograph/source/${sourceMonographId}/target/${targetMonographId}`);
    }

    async saveMergedProceedingsMetadata(leftProceedingsId: number, rightProceedingsId: number, body: MergedProceedings): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/proceedings/metadata/${leftProceedingsId}/${rightProceedingsId}`, body);
    }

    async saveMergedPersonsMetadata(leftPersonId: number, rightPersonId: number, body: MergedPersons): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/person/metadata/${leftPersonId}/${rightPersonId}`, body);
    }

    async saveMergedOrganisationUnitsMetadata(leftOUId: number, rightOUId: number, body: MergedOrganisationUnits): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/organisation-unit/metadata/${leftOUId}/${rightOUId}`, body);
    }

    async saveMergedConferencesMetadata(leftConferenceId: number, rightConferenceId: number, body: MergedConferences): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/conference/metadata/${leftConferenceId}/${rightConferenceId}`, body);
    }

    async saveMergedJournalsMetadata(leftJournalId: number, rightJournalId: number, body: MergedJournals): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/journal/metadata/${leftJournalId}/${rightJournalId}`, body);
    }

    async saveMergedBookSeriesMetadata(leftBookSeriesId: number, rightBookSeriesId: number, body: MergedBookSeries): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/book-series/metadata/${leftBookSeriesId}/${rightBookSeriesId}`, body);
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

    async saveMergedThesesMetadata(leftThesisId: number, rightThesisId: number, body: MergedTheses): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/thesis/metadata/${leftThesisId}/${rightThesisId}`, body);
    }

    async saveMergedJournalPublicationsMetadata(leftJournalPublicationId: number, rightJournalPublicationId: number, body: MergedJournalPublications): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/journal-publication/metadata/${leftJournalPublicationId}/${rightJournalPublicationId}`, body);
    }

    async saveMergedMonographsMetadata(leftMonographId: number, rightMonographId: number, body: MergedMonographs): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/monograph/metadata/${leftMonographId}/${rightMonographId}`, body);
    }

    async saveMergedMonographPublicationsMetadata(leftMonographPublicationId: number, rightMonographPublicationId: number, body: MergedMonographPublications): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `merge/monograph-publication/metadata/${leftMonographPublicationId}/${rightMonographPublicationId}`, body);
    }
}

export default new MergeService();
  