import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { CitationResponse, Dataset, DocumentAffiliationRequest, DocumentPublicationIndex, JournalPublication, Monograph, MonographPublication, Patent, ProceedingsPublication, ProceedingsPublicationResponse, PublicationType, Software, Thesis } from "@/models/PublicationModel";
import i18n from "@/i18n";


export class DocumentPublicationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getDocumentCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "document/count");
  }

  async searchDocumentPublications(tokens: string, institutionId: number | null, returnOnlyUnclassifiedEntities: boolean, allowedTypes: PublicationType[]): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    let allowedTypesParam= "";
    allowedTypes.forEach(allowedType => {
      allowedTypesParam += `&allowedTypes=${allowedType}`;
    });
    
    return super.sendRequest(axios.get, `document/simple-search?${tokens}${institutionId ? ("&institutionId=" + institutionId) : ""}&unclassified=${returnOnlyUnclassifiedEntities}${allowedTypesParam}`);
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

  async readDataset(datasetId: number): Promise<AxiosResponse<Dataset>> {
    return super.sendRequest(axios.get, `dataset/${datasetId}`);
  }

  async readPatent(patentId: number): Promise<AxiosResponse<Patent>> {
    return super.sendRequest(axios.get, `patent/${patentId}`);
  }

  async readMonograph(monographId: number): Promise<AxiosResponse<Monograph>> {
    return super.sendRequest(axios.get, `monograph/${monographId}`);
  }

  async findMyPublicationsInJournal(journalId: number): Promise<AxiosResponse<DocumentPublicationIndex[]>> {
    return super.sendRequest(axios.get, `journal-publication/journal/${journalId}/my-publications`);
  }

  async findPublicationsInJournal(journalId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `journal-publication/journal/${journalId}?${pageable}`);
  }

  async findPublicationsInProceedings(proceedingsId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `proceedings-publication/proceedings/${proceedingsId}?${pageable}`);
  }

  async findPublicationsForPublisher(publisherId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/for-publisher/${publisherId}?${pageable}`);
  }

  async findPublicationsForOrganisationUnit(organisationUnitId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/for-organisation-unit/${organisationUnitId}?${pageable}`);
  }

  async createJournalPublication(body: JournalPublication): Promise<AxiosResponse<JournalPublication>> {
    return super.sendRequest(axios.post, "journal-publication", body, DocumentPublicationService.idempotencyKey);
  }

  async createProceedingsPublication(body: ProceedingsPublication): Promise<AxiosResponse<ProceedingsPublication>> {
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

  async createMonograph(body: Monograph): Promise<AxiosResponse<Monograph>> {
    return super.sendRequest(axios.post, "monograph", body, DocumentPublicationService.idempotencyKey);
  }

  async createMonographPublication(body: MonographPublication): Promise<AxiosResponse<MonographPublication>> {
    return super.sendRequest(axios.post, "monograph-publication", body, DocumentPublicationService.idempotencyKey);
  }

  async findMyPublicationsInEvent(eventId: number): Promise<AxiosResponse<ProceedingsPublicationResponse[]>> {
    return super.sendRequest(axios.get, `proceedings-publication/event/${eventId}/my-publications`);
  }

  async findPublicationsInEvent(eventId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `proceedings-publication/event/${eventId}?${pageable}`);
  }

  async findResearcherPublications(researcherId: number, tokens: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/for-researcher/${researcherId}?${tokens}`);
  }

  async findResearchOutputIds(documentId: number): Promise<AxiosResponse<number[]>> {
    return super.sendRequest(axios.get, `document/research-output/${documentId}`);
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

  async updateMonograph(monographId: number, updatedMonograph: Monograph): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `monograph/${monographId}`, updatedMonograph);
  }

  async updateMonographPublication(monographPublicationId: number, updatedMonographPublication: MonographPublication): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `monograph-publication/${monographPublicationId}`, updatedMonographPublication);
  }

  async updateProceedingsPublication(proceedingsPublicationId: number, updatedProceedingsPublication: ProceedingsPublication): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `proceedings-publication/${proceedingsPublicationId}`, updatedProceedingsPublication);
  }

  async updateJournalPublication(journalPublicationId: number, updatedJournalPublication: JournalPublication): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `journal-publication/${journalPublicationId}`, updatedJournalPublication);
  }

  async reorderContribution(publicationId: number, contributionId: number, oldOrderNumber: number, newOrderNumber: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `document/${publicationId}/reorder-contribution/${contributionId}`, {oldContributionOrderNumber: oldOrderNumber, newContributionOrderNumber: newOrderNumber});
  }

  async searchMonographs(tokens: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `monograph/simple-search?${tokens}`);
  }

  async findMyPublicationsInMonograph(monographId: number): Promise<AxiosResponse<DocumentPublicationIndex[]>> {
    return super.sendRequest(axios.get, `monograph-publication/monograph/${monographId}/my-publications`);
  }

  async findPublicationsInMonograph(journalId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `monograph-publication/monograph/${journalId}?${pageable}`);
  }

  async readMonographPublication(monographPublicationId: number): Promise<AxiosResponse<MonographPublication>> {
    return super.sendRequest(axios.get, `monograph-publication/${monographPublicationId}`);
  }

  async readThesis(thesisId: number): Promise<AxiosResponse<Thesis>> {
    return super.sendRequest(axios.get, `thesis/${thesisId}`);
  }

  async createThesis(body: Thesis): Promise<AxiosResponse<Thesis>> {
    return super.sendRequest(axios.post, "thesis", body, DocumentPublicationService.idempotencyKey);
  }

  async updateThesis(thesisId: number, body: Thesis): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `thesis/${thesisId}`, body);
  }

  async deleteMonograph(monographId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `monograph/${monographId}`);
  }

  async forceDeleteMonograph(monographId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `monograph/force/${monographId}`);
  }

  async findPotentialClaims(parameters: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document-claim?${parameters}`);
  }

  async claimPublication(documentId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `document-claim/${documentId}`);
  }

  async declinePublicationClaim(documentId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `document-claim/decline/${documentId}`);
  }

  async unbindPersonFromPublication(documentId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `document/unbind-researcher/${documentId}`);
  }

  async fetchCitations(documentId: number): Promise<AxiosResponse<CitationResponse>> {
    return super.sendRequest(axios.get, `document/${documentId}/cite?lang=${i18n.vueI18n.global.locale}`);
  }

  async fetchNonAffiliatedDocuments(institutionId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `document/non-affiliated/${institutionId}?${pageable}`);
  }

  async updateDocumentAffiliations(institutionId: number, affiliationRequest: DocumentAffiliationRequest): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.patch, `document/add-affiliation/${institutionId}`, affiliationRequest);
  }

  async checkIdentifierUsage(identifier: string, documentId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `document/identifier-usage/${documentId}?identifier=${encodeURIComponent(identifier)}`);
  }

  async checkMonographIdentifierUsage(identifier: string, monographId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `monograph/identifier-usage/${monographId}?identifier=${encodeURIComponent(identifier)}`);
  }

  async putThesisOnPublicReview(thesisId: number, continueLastReview: boolean): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `thesis/put-on-public-review/${thesisId}?continue=${continueLastReview}`);
  }

  async removeThesisFromPublicReview(thesisId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `thesis/remove-from-public-review/${thesisId}`);
  }
}

export default new DocumentPublicationService();