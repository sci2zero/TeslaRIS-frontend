import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { CommissionRelation, CommissionRelationResponse, ReorderCommissionRelation } from "@/models/AssessmentModel";


export class CommissionRelationService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchAllCommissionRelations(sourceCommissionId: number): Promise<AxiosResponse<CommissionRelationResponse[]>> {
        return super.sendRequest(axios.get, `assessment/commission-relation/${sourceCommissionId}`);
    }

    async addCommissionRelation(body: CommissionRelation): Promise<AxiosResponse<CommissionRelationResponse[]>> {
        return super.sendRequest(axios.patch, `assessment/commission-relation/${body.sourceCommissionId}`, body, CommissionRelationService.idempotencyKey);
    }

    async updateCommissionRelation(body: CommissionRelation, commissionRelationId: number): Promise<AxiosResponse<CommissionRelationResponse[]>> {
        return super.sendRequest(axios.put, `assessment/commission-relation/${body.sourceCommissionId}/${commissionRelationId}`, body);
    }

    async deleteCommissionRelation(commissionId: number, commissionRelationId: number): Promise<AxiosResponse<CommissionRelationResponse[]>> {
        return super.sendRequest(axios.delete, `assessment/commission-relation/${commissionId}/${commissionRelationId}`);
    }

    async reorderCommissionRelations(body: ReorderCommissionRelation, commissionId: number, commissionRelationId: number): Promise<AxiosResponse<CommissionRelationResponse[]>> {
        return super.sendRequest(axios.patch, `assessment/commission-relation/${commissionId}/${commissionRelationId}`, body, CommissionRelationService.idempotencyKey);
    }
}

export default new CommissionRelationService();
