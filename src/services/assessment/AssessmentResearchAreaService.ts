import axios, { type AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import { type AssessmentResearchArea } from "@/models/AssessmentModel";
import { type PersonResponse } from "@/models/PersonModel";
import { type Page } from "@/models/Common";


export class AssessmentResearchAreaService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async readAssessmentResearchAreas(): Promise<AxiosResponse<AssessmentResearchArea[]>> {
        return super.sendRequest(axios.get, "assessment/research-area");
    }

    async readPersonAssessmentResearchArea(personId: number): Promise<AxiosResponse<AssessmentResearchArea>> {
        return super.sendRequest(axios.get, `assessment/research-area/${personId}`);
    }

    async readPersonAssessmentResearchAreaForCommission(commissionId: number, code: string): Promise<AxiosResponse<Page<PersonResponse>>> {
        return super.sendRequest(axios.get, `assessment/research-area/${code}/${commissionId}?page=0&size=10`);
    }

    async setPersonAssessmentResearchArea(personId: number, researchAreaCode: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `assessment/research-area/${personId}/${researchAreaCode}`, {}, AssessmentResearchAreaService.idempotencyKey);
    }

    async setPersonAssessmentResearchAreaForCommission(personId: number, researchAreaCode: string, commissionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `assessment/research-area/${personId}/${researchAreaCode}/${commissionId}`, {}, AssessmentResearchAreaService.idempotencyKey);
    }

    async deletePersonAssessmentResearchArea(personId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/research-area/${personId}`);
    }

    async removePersonAssessmentResearchAreaForCommission(personId: number, commissionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/research-area/${personId}/${commissionId}`);
    }
}

export default new AssessmentResearchAreaService();
