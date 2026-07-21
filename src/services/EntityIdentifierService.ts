import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { DocumentIdentifier, EntityIdentifierResponse, EventIdentifier, OrganisationUnitIdentifier, PersonIdentifier, PublicationSeriesIdentifier } from "@/models/IdentifierModel";


export class EntityIdentifierService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();


    async fetchDocumentIdentifiers(documentId: number): Promise<AxiosResponse<EntityIdentifierResponse[]>> {
        return super.sendRequest(axios.get, `document-identifier/${documentId}`);
    }

    async fetchEventIdentifiers(eventId: number): Promise<AxiosResponse<EntityIdentifierResponse[]>> {
        return super.sendRequest(axios.get, `event-identifier/${eventId}`);
    }

    async fetchOUIdentifiers(ouId: number): Promise<AxiosResponse<EntityIdentifierResponse[]>> {
        return super.sendRequest(axios.get, `organisation-unit-identifier/${ouId}`);
    }

    async fetchPersonIdentifiers(personId: number): Promise<AxiosResponse<EntityIdentifierResponse[]>> {
        if (!personId) {
            return Promise.resolve({
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            } as AxiosResponse<EntityIdentifierResponse[]>);
        }

        return super.sendRequest(axios.get, `person-identifier/${personId}`);
    }

    async fetchPublicationSeriesIdentifiers(publicationSeriesId: number): Promise<AxiosResponse<EntityIdentifierResponse[]>> {
        return super.sendRequest(axios.get, `publication-series-identifier/${publicationSeriesId}`);
    }

    async createDocumentIdentifier(body: DocumentIdentifier): Promise<AxiosResponse<EntityIdentifierResponse>> {
        return super.sendRequest(axios.post, `document-identifier/${body.documentId}`, body, EntityIdentifierService.idempotencyKey);
    }

    async createPersonIdentifier(body: PersonIdentifier): Promise<AxiosResponse<EntityIdentifierResponse>> {
        return super.sendRequest(axios.post, `person-identifier/${body.personId}`, body, EntityIdentifierService.idempotencyKey);
    }

    async createOrganisationUnitIdentifier(body: OrganisationUnitIdentifier): Promise<AxiosResponse<EntityIdentifierResponse>> {
        return super.sendRequest(axios.post, `organisation-unit-identifier/${body.organisationUnitId}`, body, EntityIdentifierService.idempotencyKey);
    }

    async createEventIdentifier(body: EventIdentifier): Promise<AxiosResponse<EntityIdentifierResponse>> {
        return super.sendRequest(axios.post, `event-identifier`, body, EntityIdentifierService.idempotencyKey);
    }

    async createPublicationSeriesIdentifier(body: PublicationSeriesIdentifier): Promise<AxiosResponse<EntityIdentifierResponse>> {
        return super.sendRequest(axios.post, `publication-series-identifier`, body, EntityIdentifierService.idempotencyKey);
    }

    async updateDocumentIdentifier(body: DocumentIdentifier, documentIdentifierId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `document-identifier/${body.documentId}/${documentIdentifierId}`, body);
    }

    async updatePersonIdentifier(body: PersonIdentifier, personIdentifierId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `person-identifier/${body.personId}/${personIdentifierId}`, body);
    }

    async updateOrganisationUnitIdentifier(body: OrganisationUnitIdentifier, organisationUnitIdentifierId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `organisation-unit-identifier/${body.organisationUnitId}/${organisationUnitIdentifierId}`, body);
    }
    
    async updateEventIdentifier(body: EventIdentifier, eventIdentifierId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `event-identifier/${eventIdentifierId}`, body);
    }

    async updatePublicationSeriesIdentifier(body: PublicationSeriesIdentifier, publicationSeriesIdentifierId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `publication-series-identifier/${publicationSeriesIdentifierId}`, body);
    }

    async deleteEntityIdentifier(entityIdentifierId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `entity-identifier/${entityIdentifierId}`);
    }
    
}

export default new EntityIdentifierService();
