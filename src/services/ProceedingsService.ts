import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Proceedings, ProceedingsResponse } from "@/models/ProceedingsModel";

export class ProceedingsService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async createProceedings(body: Proceedings): Promise<AxiosResponse<Proceedings>> {
    return super.sendRequest(axios.post, "proceedings", body, ProceedingsService.idempotencyKey);
  }

  async readProceedings(proceedingsId: number): Promise<AxiosResponse<ProceedingsResponse>> {
    return super.sendRequest(axios.get, `proceedings/${proceedingsId}`);
  }

  async readProceedingsForEvent(eventId: number): Promise<AxiosResponse<ProceedingsResponse[]>> {
    return super.sendRequest(axios.get, `proceedings/for-event/${eventId}`);
  }

  async updateProceedings(proceedingsId: number, updatedProceedings: Proceedings): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `proceedings/${proceedingsId}`, updatedProceedings);
  }

  async deleteProceedings(proceedingsId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `proceedings/${proceedingsId}`);
  }

  async forceDeleteProceedings(proceedingsId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `proceedings/force/${proceedingsId}`);
  }

  async checkProceedingsIdentifierUsage(identifier: string, proceedingsId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `proceedings/identifier-usage/${proceedingsId}?identifier=${encodeURIComponent(identifier)}`);
  }
}

export default new ProceedingsService();
