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

  async validateDocumentMetadata(documentId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `organisation-unit/trust-configuration/validate-document-metadata/${documentId}`);
  }

  async validateDocumentFiles(documentId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `organisation-unit/trust-configuration/validate-document-files/${documentId}`);
  }

  async fetchDocumentValidationStatus(documentId: number): Promise<AxiosResponse<{a: boolean, b: boolean}>> {
    return super.sendRequest(axios.get, `organisation-unit/trust-configuration/document/${documentId}`);
  }
}

export default new OrganisationUnitTrustConfigurationService();
