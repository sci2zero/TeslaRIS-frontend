import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { Dataset, DocumentPublicationIndex, JournalPublication, Patent, ProceedingsPublication, Software } from "@/models/PublicationModel";


export class DocumentPublicationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getDocumentCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "document/count");
  }

  async searchDocumentPublications(tokens: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/simple-search?${tokens}`);
  }

  async readJournalPublication(journalPublicationId: number): Promise<AxiosResponse<JournalPublication>> {
    return super.sendRequest(axios.get, `journal-publication/${journalPublicationId}`);
  }

  async readProceedingsPublication(proceedingsPublicationId: number): Promise<AxiosResponse<ProceedingsPublication>> {
    return super.sendRequest(axios.get, `proceedings-publication/${proceedingsPublicationId}`);
  }

  async readSoftware(softwareId: number): Promise<AxiosResponse<Software>> {
    return super.sendRequest(axios.get, `software/${softwareId}`);
  }

  async readDataset(datasetId: number): Promise<AxiosResponse<Software>> {
    return super.sendRequest(axios.get, `dataset/${datasetId}`);
  }

  async readPatent(patentId: number): Promise<AxiosResponse<Patent>> {
    return super.sendRequest(axios.get, `patent/${patentId}`);
  }

  async findMyPublicationsInJournal(journalId: number): Promise<AxiosResponse<DocumentPublicationIndex[]>> {
    return super.sendRequest(axios.get, `journal-publication/journal/${journalId}/my-publications`);
  }

  async findPublicationsInJournal(journalId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `journal-publication/journal/${journalId}?${pageable}`);
  }

  async findPublicationsForPublisher(publisherId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/for-publisher/${publisherId}?${pageable}`);
  }

  async createJournalPublication(body: JournalPublication): Promise<AxiosResponse<JournalPublication>> {
    return super.sendRequest(axios.post, "journal-publication", body, DocumentPublicationService.idempotencyKey);
  }

  async createJProceedingsPublication(body: ProceedingsPublication): Promise<AxiosResponse<ProceedingsPublication>> {
    return super.sendRequest(axios.post, "proceedings-publication", body, DocumentPublicationService.idempotencyKey);
  }

  async createPatent(body: Patent): Promise<AxiosResponse<Patent>> {
    return super.sendRequest(axios.post, "patent", body, DocumentPublicationService.idempotencyKey);
  }

  async createSoftware(body: Software): Promise<AxiosResponse<Software>> {
    return super.sendRequest(axios.post, "software", body, DocumentPublicationService.idempotencyKey);
  }

  async createDataset(body: Dataset): Promise<AxiosResponse<Dataset>> {
    return super.sendRequest(axios.post, "dataset", body, DocumentPublicationService.idempotencyKey);
  }

  async findMyPublicationsInEvent(eventId: number): Promise<AxiosResponse<DocumentPublicationIndex[]>> {
    return super.sendRequest(axios.get, `proceedings-publication/event/${eventId}/my-publications`);
  }

  async findPublicationsInEvent(eventId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `proceedings-publication/event/${eventId}?${pageable}`);
  }

  async findResearcherPublications(researcherId: number, tokens: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/for-researcher/${researcherId}?${tokens}`);
  }

  async deleteDocumentPublication(documentPublicationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `document/${documentPublicationId}`);
  }

  async canEdit(publicationId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `document/${publicationId}/can-edit`);
  }

  async updateSoftware(softwareId: number, updatedSoftware: Software): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `software/${softwareId}`, updatedSoftware);
  }

  async updateDataset(datasetId: number, updatedDataset: Dataset): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `dataset/${datasetId}`, updatedDataset);
  }

  async updatePatent(patentId: number, updatedPatent: Patent): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `patent/${patentId}`, updatedPatent);
  }

  async updateProceedingsPublication(proceedingsPublicationId: number, updatedProceedingsPublication: ProceedingsPublication): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `proceedings-publication/${proceedingsPublicationId}`, updatedProceedingsPublication);
  }

  async updateJournalPublication(journalPublicationId: number, updatedJournalPublication: JournalPublication): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `journal-publication/${journalPublicationId}`, updatedJournalPublication);
  }
}

export default new DocumentPublicationService();