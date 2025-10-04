import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { OrganisationUnitOutputConfiguration } from "@/models/OrganisationUnitModel";


export class OrganisationUnitOutputConfigurationService extends BaseService {

  async fetchConfigurationForOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<OrganisationUnitOutputConfiguration>> {
    return super.sendRequest(axios.get, `organisation-unit/output-configuration/${organisationUnitId}`);
  }

  async saveConfigurationForOrganisationUnit(organisationUnitId: number, body: OrganisationUnitOutputConfiguration): Promise<AxiosResponse<OrganisationUnitOutputConfiguration>> {
    return super.sendRequest(axios.patch, `organisation-unit/output-configuration/${organisationUnitId}`, body);
  }
}

export default new OrganisationUnitOutputConfigurationService();
