import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { MultilingualContent, Page, SearchFieldsResponse } from "@/models/Common";
import type { BasicPerson, PersonIndex, PersonName, PersonProfileImageRequest, PersonResponse, PersonalInfo } from "@/models/PersonModel";
import type { PersonUserResponse } from "@/models/PersonUserModel";
import type { Involvement } from "@/models/InvolvementModel";

export class PersonService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getResearcherCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "person/count");
  }

  async getPersonId(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "person/for-user");
  }

  async searchResearchers(tokens: string, strict: boolean, institutionId: number | null): Promise<AxiosResponse<Page<PersonIndex>>> {
    return super.sendRequest(axios.get, `person/simple-search?${tokens}&strict=${strict}${institutionId ? ("&institutionId=" + institutionId) : ""}`);
  }

  async searchResearchersFromInstitution(tokens: string, strict: boolean, institutionId: number, harvestable: boolean): Promise<AxiosResponse<Page<PersonIndex>>> {
    return super.sendRequest(axios.get, `person/simple-search?${tokens}&strict=${strict}&institutionId=${institutionId}&harvestable=${harvestable}`);
  }

  async findResearcherByImportIdentifier(identifier: string): Promise<AxiosResponse<PersonIndex | null>> {
    return super.sendRequest(axios.get, `person/import-identifier/${identifier}`);
  }

  async createPerson(body: BasicPerson, idempotencyKey?: string): Promise<AxiosResponse<BasicPerson>> {
    if (idempotencyKey) {
      return super.sendRequest(axios.post, "person/basic", body, idempotencyKey);  
    }
    return super.sendRequest(axios.post, "person/basic", body, PersonService.idempotencyKey);
  }

  async deleteResearcher(researcherId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `person/${researcherId}`);
  }

  async forceDeleteResearcher(researcherId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `person/force/${researcherId}`);
  }

  async migrateToUnmanagedResearcher(researcherId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `person/unmanaged/${researcherId}`);
  }

  async readPerson(personId: number): Promise<AxiosResponse<PersonResponse>> {
    return super.sendRequest(axios.get, `person/${personId}`);
  }

  async canEdit(personId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `person/${personId}/can-edit`);
  }

  async getPersonWithUser(personId: number): Promise<AxiosResponse<PersonUserResponse>> {
    return super.sendRequest(axios.get, `person/${personId}/person-user`);
  }

  async updateKeywords(personId: number, biography: MultilingualContent[]): Promise<AxiosResponse<PersonUserResponse>> {
    return super.sendRequest(axios.patch, `person/keywords/${personId}`, biography);
  }

  async updateBiography(personId: number, keywords: MultilingualContent[]): Promise<AxiosResponse<PersonUserResponse>> {
    return super.sendRequest(axios.patch, `person/biography/${personId}`, keywords);
  }

  async updatePersonalInfo(personId: number, personalInfo: PersonalInfo): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `person/personal-info/${personId}`, personalInfo);
  }

  async findEmployeesForOU(organisationUnitId: number, tokens: string, fetchAlumni: boolean): Promise<AxiosResponse<Page<PersonIndex>>> {
    return super.sendRequest(axios.get, `person/employed-at/${organisationUnitId}?${tokens}&fetchAlumni=${fetchAlumni}`);
  }

  async updateOtherNames(otherNames: PersonName[], personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `person/other-names/${personId}`, otherNames);
  }

  async updatePrimaryName(personId: number, name: PersonName): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `person/name/${personId}`, name);
  }

  async selectPrimaryName(otherNameId: number, personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `person/name/${personId}/${otherNameId}`);
  }

  async getLatestAffiliation(personId: number): Promise<AxiosResponse<Involvement>> {
    return super.sendRequest(axios.get, `person/${personId}/latest-involvement`);
  }

  async isPersonBoundToAUser(personId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `person/is-bound/${personId}`);
  }

  async updatePersonProfileImage(imageFile: PersonProfileImageRequest, personId: number): Promise<AxiosResponse<string>> {
    return super.sendMultipartFormDataRequest(axios.patch, `person/profile-image/${personId}`, imageFile, PersonService.idempotencyKey);
  }

  async removePersonProfileImage(personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `person/profile-image/${personId}`);
  }

  async checkIdentifierUsage(identifier: string, personId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `person/identifier-usage/${personId}?identifier=${encodeURIComponent(identifier)}`);
  }

  async getSearchFields(onlyExportFields: boolean): Promise<AxiosResponse<SearchFieldsResponse[]>> {
    return super.sendRequest(axios.get, `person/fields?export=${onlyExportFields}`);
  }
}

export default new PersonService();
