import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type PersonFieldVisibility } from "@/models/PersonModel";


export class PersonFieldVisibilityService extends BaseService {

  async readPublicFieldVisibilityConfiguration(personId: number): Promise<AxiosResponse<PersonFieldVisibility>> {
    return super.sendRequest(axios.get, `person-field-visibility/${personId}`);
  }

  async savePublicFieldVisibilityConfiguration(personId: number, body: PersonFieldVisibility): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `person-field-visibility/${personId}`, body);
  }
}

export default new PersonFieldVisibilityService();
