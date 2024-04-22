import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Education, Employment, Membership } from "@/models/InvolvementModel";

export class InvolvementService extends BaseService {

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
}

export default new InvolvementService();