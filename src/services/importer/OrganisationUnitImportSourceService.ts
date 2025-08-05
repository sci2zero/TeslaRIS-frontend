import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { OrganisationUnitImportSource } from "@/models/OrganisationUnitModel";

export class OrganisationUnitImportSourceService extends BaseService {

  async fetchConfigurationForOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<OrganisationUnitImportSource>> {
    return super.sendRequest(axios.get, `import-source-configuration/${organisationUnitId}`);
  }

  async saveConfigurationForOrganisationUnit(organisationUnitId: number, body: OrganisationUnitImportSource): Promise<AxiosResponse<OrganisationUnitImportSource>> {
    return super.sendRequest(axios.patch, `import-source-configuration/${organisationUnitId}`, body);
  }
}

export default new OrganisationUnitImportSourceService();
