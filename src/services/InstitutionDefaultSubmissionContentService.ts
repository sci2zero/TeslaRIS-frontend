import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import { type InstitutionDefaultSubmissionContent } from "@/models/OrganisationUnitModel";


export class InstitutionDefaultSubmissionContentService extends BaseService {

    async getContentForInstitution(institutionId: number): Promise<AxiosResponse<InstitutionDefaultSubmissionContent>> {
        return super.sendRequest(axios.get, `institution-default-submission-content/institution/${institutionId}`);
    }

    async getContentForUser(): Promise<AxiosResponse<InstitutionDefaultSubmissionContent>> {
        return super.sendRequest(axios.get, "institution-default-submission-content/for-user");
    }

    async saveContent(institutionId: number, body: InstitutionDefaultSubmissionContent): Promise<AxiosResponse<InstitutionDefaultSubmissionContent>> {
        return super.sendRequest(axios.patch, `institution-default-submission-content/${institutionId}`, body);
    }
}

export default new InstitutionDefaultSubmissionContentService();
