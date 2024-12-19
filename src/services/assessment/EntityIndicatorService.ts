import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { DocumentIndicator, EntityIndicatorResponse, EventIndicator } from "@/models/AssessmentModel";


export class EntityIndicatorService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchDocumentIndicators(documentId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/document-indicator/${documentId}`);
    }

    async fetchEventIndicators(eventId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/event-indicator/${eventId}`);
    }

    async fetchOUIndicators(ouId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/organisation-unit-indicator/${ouId}`);
    }

    async fetchPersonIndicators(personId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/person-indicator/${personId}`);
    }

    async fetchPublicationSeriesIndicators(publicationSeriesId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/publication-series-indicator/${publicationSeriesId}`);
    }

    async createDocumentIndicator(body: DocumentIndicator): Promise<AxiosResponse<EntityIndicatorResponse>> {
        return super.sendRequest(axios.post, `assessment/document-indicator/${body.documentId}`, body, EntityIndicatorService.idempotencyKey);
    }

    async createEventIndicator(body: EventIndicator): Promise<AxiosResponse<EntityIndicatorResponse>> {
        return super.sendRequest(axios.post, `assessment/event-indicator/${body.eventId}`, body, EntityIndicatorService.idempotencyKey);
    }

    async updateDocumentIndicator(body: DocumentIndicator, documentIndicatorId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/document-indicator/${body.documentId}/${documentIndicatorId}`, body);
    }

    async updateEventIndicator(body: EventIndicator, eventIndicatorId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/event-indicator/${body.eventId}/${eventIndicatorId}`, body);
    }

    async deleteEntityIndicator(documentIndicatorId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/entity-indicator/${documentIndicatorId}`);
    }
}

export default new EntityIndicatorService();
