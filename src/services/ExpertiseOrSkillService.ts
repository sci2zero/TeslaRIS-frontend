import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ExpertiseOrSkill, ExpertiseOrSkillResponse } from "@/models/PersonModel";

export class ExpertiseOrSkillService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async createExpertiseOrSkill(body: ExpertiseOrSkill, personId: number): Promise<AxiosResponse<ExpertiseOrSkillResponse>> {
    return super.sendRequest(axios.post, `expertise-or-skill/${personId}`, body, ExpertiseOrSkillService.idempotencyKey);
  }

  async updateExpertiseOrSkill(body: ExpertiseOrSkill, personId: number, expertiseOrSkillId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `expertise-or-skill/${personId}/${expertiseOrSkillId}`, body, ExpertiseOrSkillService.idempotencyKey);
  }

  async deleteExpertiseOrSkill(personId: number, expertiseOrSkillId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `expertise-or-skill/${personId}/${expertiseOrSkillId}`);
  }
}

export default new ExpertiseOrSkillService();
