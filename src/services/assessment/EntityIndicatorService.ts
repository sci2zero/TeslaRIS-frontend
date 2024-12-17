import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { DocumentIndicator, EntityIndicatorResponse } from "@/models/AssessmentModel";


export class EntityIndicatorService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchDocumentIndicators(documentId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/document-indicator/${documentId}`);
    }

    async fetchOUIndicators(ouId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/organisation-unit-indicator/${ouId}`);
    }

    async fetchPersonIndicators(personId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/person-indicator/${personId}`);
    }

    async createDocumentIndicator(body: DocumentIndicator): Promise<AxiosResponse<EntityIndicatorResponse>> {
        return super.sendRequest(axios.post, "assessment/document-indicator", body, EntityIndicatorService.idempotencyKey);
    }
}

export default new EntityIndicatorService();
