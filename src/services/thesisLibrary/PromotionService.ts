import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { Promotion } from "@/models/ThesisLibraryModel";


export class PromotionService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async getAllPromotions(pageable: string): Promise<AxiosResponse<Page<Promotion>>> {
        return super.sendRequest(axios.get, `promotion?${pageable}`);
    }

    async getNonFinishedPromotions(pageable: string): Promise<AxiosResponse<Page<Promotion>>> {
        return super.sendRequest(axios.get, `promotion?${pageable}`);
    }

    async createPromotion(body: Promotion): Promise<AxiosResponse<Promotion>> {
        return super.sendRequest(axios.post, "promotion", body, PromotionService.idempotencyKey);
    }

    async updatePromotion(promotionId: number, body: Promotion): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `promotion/${promotionId}`, body);
    }

    async deletePromotion(promotionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `promotion/${promotionId}`);
    }
}

export default new PromotionService();