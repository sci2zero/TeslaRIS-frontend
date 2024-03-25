import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { BasicPerson, PersonIndex, PersonResponse } from "@/models/PersonModel";
import type { PersonUserResponse } from "@/models/PersonUserModel";

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

  async canEdit(personId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `person/${personId}/can-edit`);
  }

  async getPersonWithUser(personId: number): Promise<AxiosResponse<PersonUserResponse>> {
    return super.sendRequest(axios.get, `person/${personId}/person-user`);
  }
}

export default new PersonService();