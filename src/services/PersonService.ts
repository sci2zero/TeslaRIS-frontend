import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { PersonIndex } from "@/models/PersonModel";

export class PersonService extends BaseService {

  async getResearcherCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "person/count");
  }

  async searchResearchers(tokens: string): Promise<AxiosResponse<Page<PersonIndex>>> {
    return super.sendRequest(axios.get, `person/simple-search?${tokens}`);
  }

  async deleteResearcher(researcherId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `person/${researcherId}`);
  }
}

export default new PersonService();