import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { DocumentIndicator, EntityIndicatorResponse, EventIndicator, IFTableResponse } from "@/models/AssessmentModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import { AccessRights, type DocumentFileResponse, License, ResourceType } from "@/models/DocumentFileModel";


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

    async fetchPublicationSeriesIFTableIndicators(publicationSeriesId: number, fromYear: number, toYear: number): Promise<AxiosResponse<IFTableResponse>> {
        return super.sendRequest(axios.get, `assessment/publication-series-indicator/if-table/${publicationSeriesId}?fromYear=${fromYear}&toYear=${toYear}`);
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

    async deleteEntityIndicator(entityIndicatorId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/entity-indicator/${entityIndicatorId}`);
    }

    async addEntityIndicatorProof(proof: any, entityIndicatorId: number, idempotencyKey: string | undefined): Promise<AxiosResponse<DocumentFileResponse>> {
        proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        proof.accessRights = getNameFromOrdinal(AccessRights, proof.accessRights);
        return super.sendMultipartFormDataRequest(axios.patch, `assessment/entity-indicator/add-proof/${entityIndicatorId}`, proof, idempotencyKey ? idempotencyKey : EntityIndicatorService.idempotencyKey);
    }

    async updateEntityIndicatorProof(proof: any, entityIndicatorId: number): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof proof.license === "number") {
            proof.license = getNameFromOrdinal(License, proof.license);
        }
        if (typeof proof.resourceType === "number") {
            proof.resourceType = getNameFromOrdinal(ResourceType, proof.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `assessment/entity-indicator/update-proof/${entityIndicatorId}`, proof, EntityIndicatorService.idempotencyKey);
    }

    async deleteEntityIndicatorProof(proofId: number, entityIndicatorId: number): Promise<void> {
        return super.sendRequest(axios.delete, `assessment/entity-indicator/${entityIndicatorId}/${proofId}`);
    }

    getDisposableIdempotencyKey(): string {
        return BaseService.generateIdempotencyKey();
    }

    async uploadFilesAndFetchIndicators(files: File[], responseDataId: number) {
        const uploadPromises = files.map(fileItem => 
            this.addEntityIndicatorProof(
                {
                    file: fileItem,
                    description: [],
                    resourceType: ResourceType.SUPPLEMENT,
                    accessRights: AccessRights.OPEN_ACCESS,
                    license: License.BY_NC_ND
                },
                responseDataId,
                this.getDisposableIdempotencyKey()
            )
        );
        return Promise.all(uploadPromises);
    }
}

export default new EntityIndicatorService();
