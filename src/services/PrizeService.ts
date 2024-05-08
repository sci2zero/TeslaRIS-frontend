import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Prize, PrizeResponse } from "@/models/PersonModel";

export class PrizeService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

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
