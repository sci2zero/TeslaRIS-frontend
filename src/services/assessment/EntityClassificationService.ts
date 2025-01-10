import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { EntityClassificationResponse } from "@/models/AssessmentModel";


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

    async fetchPublicationSeriesClassifications(publicationSeriesId: number): Promise<AxiosResponse<EntityClassificationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/publication-series-assessment-classification/${publicationSeriesId}`);
    }

    // async createDocumentClassification(body: DocumentClassification): Promise<AxiosResponse<EntityClassificationResponse>> {
    //     return super.sendRequest(axios.post, `assessment/document-assessment-classification/${body.documentId}`, body, EntityClassificationService.idempotencyKey);
    // }

    // async createEventClassification(body: EventClassification): Promise<AxiosResponse<EntityClassificationResponse>> {
    //     return super.sendRequest(axios.post, `assessment/event-assessment-classification/${body.eventId}`, body, EntityClassificationService.idempotencyKey);
    // }

    // async updateDocumentClassification(body: DocumentClassification, documentClassificationId: number): Promise<AxiosResponse<void>> {
    //     return super.sendRequest(axios.put, `assessment/document-assessment-classification/${body.documentId}/${documentClassificationId}`, body);
    // }

    // async updateEventClassification(body: EventClassification, eventClassificationId: number): Promise<AxiosResponse<void>> {
    //     return super.sendRequest(axios.put, `assessment/event-assessment-classification/${body.eventId}/${eventClassificationId}`, body);
    // }

    async deleteEntityClassification(entityClassificationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/entity-assessment-classification/${entityClassificationId}`);
    }
}

export default new EntityClassificationService();
