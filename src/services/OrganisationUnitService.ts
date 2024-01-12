import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { OrganisationUnitIndex } from "@/models/OrganisationUnitModel";

export class OrganisationUnitService extends BaseService {

  async getOUCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "organisation-unit/count");
  }

  async searchOUs(tokens: string): Promise<AxiosResponse<Page<OrganisationUnitIndex>>> {
    return super.sendRequest(axios.get, `organisation-unit/simple-search?${tokens}`);
  }

  async deleteOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit/${organisationUnitId}`);
  }
}

export default new OrganisationUnitService();