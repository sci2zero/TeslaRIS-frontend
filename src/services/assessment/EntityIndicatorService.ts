import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { EntityIndicatorResponse } from "@/models/AssessmentModel";


export class EntityIndicatorService extends BaseService {

    async fetchDocumentIndicators(documentId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/document-indicator/${documentId}`);
    }

    async fetchOUIndicators(ouId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/organisation-unit-indicator/${ouId}`);
    }

    async fetchPersonIndicators(personId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/person-indicator/${personId}`);
    }
}

export default new EntityIndicatorService();
