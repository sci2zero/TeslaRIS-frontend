import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";


export class CookieService extends BaseService {

  async setCookiePreferences(optOut: boolean): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `cookie?optOut=${optOut}`);
  }
}

export default new CookieService();
