import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Prize, PrizeIndex, PrizeResponse } from "@/models/PersonModel";
import { type Page } from "@/models/Common";

export class PrizeService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async searchPrizes(tokenParams: string, institutionId: number | null = null, commissionId: number | null = null, returnOnlyUnclassifiedEntities: boolean = false): Promise<AxiosResponse<Page<PrizeIndex>>> {
    return super.sendRequest(axios.get, `prize/simple-search?${tokenParams}${institutionId ? ("&institutionId=" + institutionId) : ""}${commissionId ? ("&commissionId=" + commissionId) : ""}&unclassified=${returnOnlyUnclassifiedEntities}`);
  }
  
  async createPrize(body: Prize, personId: number): Promise<AxiosResponse<PrizeResponse>> {
    return super.sendRequest(axios.post, `prize/${personId}`, body, PrizeService.idempotencyKey);
  }

  async updatePrize(body: Prize, personId: number, prizeId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `prize/${personId}/${prizeId}`, body, PrizeService.idempotencyKey);
  }

  async deletePrize(personId: number, prizeId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `prize/${personId}/${prizeId}`);
  }
}

export default new PrizeService();
