import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";

export class PersonService extends BaseService {

  async searchResearchers(tokens: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `person/simple-search?${tokens}`);
  }
}

export default new PersonService();