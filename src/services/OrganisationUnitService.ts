import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { OrganisationUnitRequest, OrganisationUnitIndex, OrganisationUnitResponse, OrganisationUnitRelationResponse, OrganisationUnitRelationRequest } from "@/models/OrganisationUnitModel";

export class OrganisationUnitService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getOUCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "organisation-unit/count");
  }

  async readOU(organisationUnitId: number): Promise<AxiosResponse<OrganisationUnitResponse>> {
    return super.sendRequest(axios.get, `organisation-unit/${organisationUnitId}`);
  }

  async readOURelationsGraph(organisationUnitLeafId: number): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `organisation-unit-relation/${organisationUnitLeafId}`);
  }

  async searchOUs(tokens: string): Promise<AxiosResponse<Page<OrganisationUnitIndex>>> {
    return super.sendRequest(axios.get, `organisation-unit/simple-search?${tokens}`);
  }

  async createOrganisationUnit(body: OrganisationUnitRequest): Promise<AxiosResponse<OrganisationUnitResponse>> {
    return super.sendRequest(axios.post, "organisation-unit", body, OrganisationUnitService.idempotencyKey);
  }

  async deleteOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit/${organisationUnitId}`);
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
    return super.sendRequest(axios.post, "organisation-unit-relation/", relation, OrganisationUnitService.idempotencyKey);
  }

  async updateOURelation(relation: OrganisationUnitRelationRequest, relationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `organisation-unit-relation/${relationId}`, relation);
  }

  async deleteOURelation(relationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `organisation-unit-relation/${relationId}`);
  }
}

export default new OrganisationUnitService();