import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ApiKeyRequest, ApiKeyResponse, Page } from "@/models/Common";


export class ApiKeyService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async readAllApiKeys(pageable: string): Promise<AxiosResponse<Page<ApiKeyResponse>>> {
        return super.sendRequest(axios.get, `api-key?${pageable}`);
    }

    async deleteApiKey(apiKeyId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `api-key/${apiKeyId}`);
    }

    async createApiKey(body: ApiKeyRequest): Promise<AxiosResponse<ApiKeyResponse>> {
        return super.sendRequest(axios.post, "api-key", body, ApiKeyService.idempotencyKey);
    }

    async updateApiKey(apiKeyId: number, body: ApiKeyRequest): Promise<AxiosResponse<ApiKeyResponse>> {
        return super.sendRequest(axios.put, `api-key/${apiKeyId}`, body);
    }
}

export default new ApiKeyService();
