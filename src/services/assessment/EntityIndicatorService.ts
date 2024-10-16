import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { EntityIndicatorResponse } from "@/models/AssessmentModel";


export class EntityIndicatorService extends BaseService {

    async fetchDocumentIndicators(documentId: number): Promise<AxiosResponse<EntityIndicatorResponse[]>> {
        return super.sendRequest(axios.get, `assessment/document-indicator/${documentId}`);
    }
}

export default new EntityIndicatorService();
