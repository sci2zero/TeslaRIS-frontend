import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { BasicPerson, PersonIndex, PersonResponse } from "@/models/PersonModel";

export class PersonService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getResearcherCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "person/count");
  }

  async searchResearchers(tokens: string): Promise<AxiosResponse<Page<PersonIndex>>> {
    return super.sendRequest(axios.get, `person/simple-search?${tokens}`);
  }

  async createPerson(body: BasicPerson): Promise<AxiosResponse<BasicPerson>> {
    return super.sendRequest(axios.post, "person/basic", body, PersonService.idempotencyKey);
  }

  async deleteResearcher(researcherId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `person/${researcherId}`);
  }

  async readPerson(personId: number): Promise<AxiosResponse<PersonResponse>> {
    return super.sendRequest(axios.get, `person/${personId}`);
  }
}

export default new PersonService();