import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { OrganisationUnitTrustConfiguration } from "@/models/OrganisationUnitModel";
import type { Page } from "@/models/Common";
import { type DocumentPublicationIndex, PublicationType } from "@/models/PublicationModel";

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

  async fetchNonValidatedDocuments(institutionId: number, params: string, allowedTypes: PublicationType[]): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    let allowedTypesParam= "";
    allowedTypes.forEach(allowedType => {
      allowedTypesParam += `&allowedTypes=${allowedType}`;
    });
    
    return super.sendRequest(axios.get, `organisation-unit/trust-configuration/non-validated-documents/${institutionId}?${params}${allowedTypesParam}`);
  }
}

export default new OrganisationUnitTrustConfigurationService();
