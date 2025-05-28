import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page, SearchFieldsResponse } from "@/models/Common";
import type { OrganisationUnitRequest, OrganisationUnitIndex, OrganisationUnitResponse, OrganisationUnitRelationResponse, OrganisationUnitRelationRequest, InstitutionLogoRequest } from "@/models/OrganisationUnitModel";

export class OrganisationUnitService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getOUCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "organisation-unit/count");
  }

  async checkIfInstitutionalAdminsExist(organisationUnitId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `organisation-unit/admin-exists/${organisationUnitId}`);
  }

  async readOU(organisationUnitId: number): Promise<AxiosResponse<OrganisationUnitResponse>> {
    return super.sendRequest(axios.get, `organisation-unit/${organisationUnitId}`);
  }

  async readOUSubUnits(organisationUnitId: number, pageable: string): Promise<AxiosResponse<Page<OrganisationUnitIndex>>> {
    return super.sendRequest(axios.get, `organisation-unit/sub-units/${organisationUnitId}?${pageable}`);
  }

  async findOUByScopusAfid(scopusAfid: string): Promise<AxiosResponse<OrganisationUnitIndex>> {
    return super.sendRequest(axios.get, `organisation-unit/scopus-afid/${scopusAfid}`);
  }

  async readOURelationsGraph(organisationUnitLeafId: number): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `organisation-unit-relation/${organisationUnitLeafId}`);
  }

  async searchOUs(tokens: string, forPersonId: number | null, topLevelInstitutionId: number | null): Promise<AxiosResponse<Page<OrganisationUnitIndex>>> {
    return super.sendRequest(axios.get, `organisation-unit/simple-search?${tokens}${forPersonId ? ("&personId=" + forPersonId) : ""}${topLevelInstitutionId ? ("&topLevelInstitutionId=" + topLevelInstitutionId) : ""}`);
  }

  async createOrganisationUnit(body: OrganisationUnitRequest, idempotencyKey?: string): Promise<AxiosResponse<OrganisationUnitResponse>> {
    if (idempotencyKey) {
      return super.sendRequest(axios.post, "organisation-unit", body, idempotencyKey);
    }
    return super.sendRequest(axios.post, "organisation-unit", body, OrganisationUnitService.idempotencyKey);
  }

  async deleteOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit/${organisationUnitId}`);
  }

  async forceDeleteOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit/force/${organisationUnitId}`);
  }

  async updateOrganisationUnit(organisationUnitId: number, updatedOU: OrganisationUnitRequest): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `organisation-unit/${organisationUnitId}`, updatedOU);
  }

  async canEdit(organisationUnitId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `organisation-unit/${organisationUnitId}/can-edit`);
  }

  async getAllRelationsForSourceOU(organisationUnitId: number): Promise<AxiosResponse<OrganisationUnitRelationResponse[]>> {
    return super.sendRequest(axios.get, `organisation-unit-relation/get-all/${organisationUnitId}`);
  }

  async createOURelation(relation: OrganisationUnitRelationRequest): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, "organisation-unit-relation", relation, OrganisationUnitService.idempotencyKey);
  }

  async updateOURelation(relation: OrganisationUnitRelationRequest, relationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `organisation-unit-relation/${relationId}`, relation);
  }

  async deleteOURelation(relationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit-relation/${relationId}`);
  }

  async checkIdentifierUsage(identifier: string, organisationUnitId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `organisation-unit/identifier-usage/${organisationUnitId}?identifier=${encodeURIComponent(identifier)}`);
  }

  async getSearchFields(onlyExportFields: boolean): Promise<AxiosResponse<SearchFieldsResponse[]>> {
    return super.sendRequest(axios.get, `organisation-unit/fields?export=${onlyExportFields}`);
  }

  async updateOrganisationUnitLogo(imageFile: InstitutionLogoRequest, orgUnitId: number): Promise<AxiosResponse<string>> {
    return super.sendMultipartFormDataRequest(axios.patch, `organisation-unit/logo/${orgUnitId}`, imageFile, OrganisationUnitService.idempotencyKey);
  }

  async removeOrganisationUnitLogo(orgUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit/logo/${orgUnitId}`);
  }
}

export default new OrganisationUnitService();