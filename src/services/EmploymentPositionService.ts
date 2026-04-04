import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { EmploymentPositionHierarchy } from "@/models/InvolvementModel";
import { type Page } from "@/models/Common";
import i18n from "@/i18n";


export class EmploymentPositionService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  
  async searchEmploymentPositions(tokens: string): Promise<AxiosResponse<Page<EmploymentPositionHierarchy>>> {
    return super.sendRequest(axios.get, `employment-position/search?${tokens}&lang=${i18n.vueI18n.global.locale}`);
  }
  
  async fetchChildEmploymentPositions(parentId: number | null): Promise<AxiosResponse<EmploymentPositionHierarchy[]>> {
    return super.sendRequest(axios.get, `employment-position/children/${parentId}`);
  }

  async createEmploymentPosition(body: EmploymentPositionHierarchy): Promise<AxiosResponse<EmploymentPositionHierarchy>> {
    return super.sendRequest(axios.post, "employment-position", body, EmploymentPositionService.idempotencyKey);
  }

  async updateEmploymentPosition(employmentPositionId: number, body: EmploymentPositionHierarchy): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `employment-position/${employmentPositionId}`, body);
  }

  async deleteEmploymentPosition(employmentPositionId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `employment-position/${employmentPositionId}`);
  }
}

export default new EmploymentPositionService();
