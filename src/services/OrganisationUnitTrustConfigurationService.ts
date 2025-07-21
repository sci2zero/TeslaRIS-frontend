import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { OrganisationUnitTrustConfiguration } from "@/models/OrganisationUnitModel";

export class OrganisationUnitTrustConfigurationService extends BaseService {

  async fetchConfigurationForOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<OrganisationUnitTrustConfiguration>> {
    return super.sendRequest(axios.get, `organisation-unit/trust-configuration/${organisationUnitId}`);
  }

  async saveConfigurationForOrganisationUnit(organisationUnitId: number, body: OrganisationUnitTrustConfiguration): Promise<AxiosResponse<OrganisationUnitTrustConfiguration>> {
    return super.sendRequest(axios.patch, `organisation-unit/trust-configuration/${organisationUnitId}`, body);
  }
}

export default new OrganisationUnitTrustConfigurationService();
