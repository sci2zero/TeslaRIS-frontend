import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { DocumentAssessmentClassification, EntityClassificationResponse, EventAssessmentClassification, PrizeAssessmentClassification, PublicationSeriesAssessmentClassification, ResearcherAssessmentResponse } from "@/models/AssessmentModel";


export class EntityClassificationService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchDocumentClassifications(documentId: number): Promise<AxiosResponse<EntityClassificationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/document-assessment-classification/${documentId}`);
    }

    async fetchEventClassifications(eventId: number): Promise<AxiosResponse<EntityClassificationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/event-assessment-classification/${eventId}`);
    }

    async fetchOUClassifications(ouId: number): Promise<AxiosResponse<EntityClassificationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/organisation-unit-assessment-classification/${ouId}`);
    }

    async fetchPersonClassifications(personId: number): Promise<AxiosResponse<EntityClassificationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/person-assessment-classification/${personId}`);
    }

    async fetchPersonAssessment(personId: number, startDate: string, endDate: string): Promise<AxiosResponse<ResearcherAssessmentResponse[]>> {
        return super.sendRequest(axios.get, `assessment/person-assessment-classification/assess/${personId}?startDate=${startDate}&endDate=${endDate}`);
    }

    async fetchPrizeClassifications(prizeId: number): Promise<AxiosResponse<EntityClassificationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/prize-assessment-classification/${prizeId}`);
    }

    async fetchPublicationSeriesClassifications(publicationSeriesId: number): Promise<AxiosResponse<EntityClassificationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/publication-series-assessment-classification/${publicationSeriesId}`);
    }

    async createDocumentClassification(body: DocumentAssessmentClassification): Promise<AxiosResponse<EntityClassificationResponse>> {
        return super.sendRequest(axios.post, `assessment/document-assessment-classification/${body.documentId}`, body, EntityClassificationService.idempotencyKey);
    }

    async createEventClassification(body: EventAssessmentClassification): Promise<AxiosResponse<EntityClassificationResponse>> {
        return super.sendRequest(axios.post, `assessment/event-assessment-classification`, body, EntityClassificationService.idempotencyKey);
    }

    async createPublicationSeriesClassification(body: PublicationSeriesAssessmentClassification): Promise<AxiosResponse<EntityClassificationResponse>> {
        return super.sendRequest(axios.post, `assessment/publication-series-assessment-classification`, body, EntityClassificationService.idempotencyKey);
    }

    async createPrizeClassification(body: PrizeAssessmentClassification): Promise<AxiosResponse<EntityClassificationResponse>> {
        return super.sendRequest(axios.post, `assessment/prize-assessment-classification`, body, EntityClassificationService.idempotencyKey);
    }

    async updateDocumentClassification(body: DocumentAssessmentClassification, documentClassificationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/document-assessment-classification/${body.documentId}/${documentClassificationId}`, body);
    }

    async updateEventClassification(body: EventAssessmentClassification, eventClassificationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/event-assessment-classification/${eventClassificationId}`, body);
    }

    async updatePublicationSeriesClassification(body: PublicationSeriesAssessmentClassification, publicationSeriesClassificationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/publication-series-assessment-classification/${publicationSeriesClassificationId}`, body);
    }

    async updatePrizeClassification(body: PrizeAssessmentClassification, prizeClassificationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/prize-assessment-classification/${prizeClassificationId}`, body);
    }

    async deleteEntityClassification(entityClassificationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/entity-assessment-classification/${entityClassificationId}`);
    }

    async canClassifyDocument(documentId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `assessment/document-assessment-classification/${documentId}/can-classify`);
    }
}

export default new EntityClassificationService();
