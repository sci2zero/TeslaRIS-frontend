import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Country } from "@/models/Common";

export class CountryService extends BaseService {

  async readCountry(countryId: number): Promise<AxiosResponse<Country>> {
    return super.sendRequest(axios.get, `country/${countryId}`);
  }
}

export default new CountryService();