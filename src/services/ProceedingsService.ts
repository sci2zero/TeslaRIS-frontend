import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Proceedings } from "@/models/ProceedingsModel";
import type { ProceedingsPublicationResponse } from "@/models/PublicationModel";

export class ProceedingsService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async createProceedings(body: Proceedings): Promise<AxiosResponse<Proceedings>> {
    return super.sendRequest(axios.post, "proceedings", body, ProceedingsService.idempotencyKey);
  }

  async readProceedingsForEvent(eventId: number): Promise<AxiosResponse<ProceedingsPublicationResponse[]>> {
    return super.sendRequest(axios.get, `proceedings/for-event/${eventId}`);
  }
}

export default new ProceedingsService();
