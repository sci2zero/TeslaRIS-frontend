import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Education, Employment, EmploymentTitle, Membership } from "@/models/InvolvementModel";

export class InvolvementService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async getEmployment(employmentId: number): Promise<AxiosResponse<Employment>> {
    return super.sendRequest(axios.get, `involvement/employment/${employmentId}`);
  }

  async getEducation(educationId: number): Promise<AxiosResponse<Education>> {
    return super.sendRequest(axios.get, `involvement/education/${educationId}`);
  }

  async getMembership(membershipId: number): Promise<AxiosResponse<Membership>> {
    return super.sendRequest(axios.get, `involvement/membership/${membershipId}`);
  }

  async getPersonEmployments(personId: number): Promise<AxiosResponse<Employment[]>> {
    return super.sendRequest(axios.get, `involvement/employments/${personId}`);
  }

  async addEmployment(employment: Employment, personId: number): Promise<AxiosResponse<Employment>> {
    return super.sendRequest(axios.post, `involvement/employment/${personId}`, employment, InvolvementService.idempotencyKey);
  }

  async addEducation(education: Education, personId: number): Promise<AxiosResponse<Education>> {
    return super.sendRequest(axios.post, `involvement/education/${personId}`, education, InvolvementService.idempotencyKey);
  }

  async addMembership(membership: Membership, personId: number): Promise<AxiosResponse<Membership>> {
    return super.sendRequest(axios.post, `involvement/membership/${personId}`, membership, InvolvementService.idempotencyKey);
  }

  async updateEmployment(employment: Employment, involvementId: number, personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `involvement/employment/${involvementId}/${personId}`, employment);
  }

  async updateEducation(education: Education, involvementId: number, personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `involvement/education/${involvementId}/${personId}`, education);
  }

  async updateMembership(membership: Membership, involvementId: number, personId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `involvement/membership/${involvementId}/${personId}`, membership);
  }

  async deleteInvolvement(personId: number, involvementId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `involvement/${involvementId}/${personId}`);
  }

  async terminateEmployment(personId: number, institutionId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `involvement/employment/${institutionId}/${personId}`);
  }

  async getEmploymentTitle(personId: boolean): Promise<AxiosResponse<EmploymentTitle>> {
    return super.sendRequest(axios.get, `involvement/employment-title/${personId}`);
}
}

export default new InvolvementService();