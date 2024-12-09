import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { Commission, CommissionResponse } from "@/models/AssessmentModel";
import type { Page } from "@/models/Common";


export class CommissionService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchAllCommissions(parameters: string): Promise<AxiosResponse<Page<CommissionResponse>>> {
        return super.sendRequest(axios.get, `assessment/commission?${parameters}`);
    }

    async readCommission(commissionId: number): Promise<AxiosResponse<CommissionResponse>> {
        return super.sendRequest(axios.get, `assessment/commission/${commissionId}`);
    }

    async createCommission(commission: Commission): Promise<AxiosResponse<CommissionResponse>> {
        return super.sendRequest(axios.post, "assessment/commission", commission, CommissionService.idempotencyKey);
    }

    async updateCommission(commissionId: number, commission: Commission): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/commission/${commissionId}`, commission);
    }

    async deleteCommission(commissionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/commission/${commissionId}`);
    }
}

export default new CommissionService();
