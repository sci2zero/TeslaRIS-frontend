import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { OrganisationUnitRequest, OrganisationUnitIndex, OrganisationUnitResponse } from "@/models/OrganisationUnitModel";

export class OrganisationUnitService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getOUCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "organisation-unit/count");
  }

  async readOU(organisationUnitId: number): Promise<AxiosResponse<OrganisationUnitResponse>> {
    return super.sendRequest(axios.get, `organisation-unit/${organisationUnitId}`);
  }

  async readOURelationsChain(organisationUnitLeafId: number): Promise<AxiosResponse<OrganisationUnitResponse[]>> {
    return super.sendRequest(axios.get, `organisation-unit-relation/${organisationUnitLeafId}`);
  }

  async searchOUs(tokens: string): Promise<AxiosResponse<Page<OrganisationUnitIndex>>> {
    return super.sendRequest(axios.get, `organisation-unit/simple-search?${tokens}`);
  }

  async createOrganisationUnit(body: OrganisationUnitRequest): Promise<AxiosResponse<OrganisationUnitRequest>> {
    return super.sendRequest(axios.post, "organisation-unit", body, OrganisationUnitService.idempotencyKey);
  }

  async deleteOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit/${organisationUnitId}`);
  }
}

export default new OrganisationUnitService();