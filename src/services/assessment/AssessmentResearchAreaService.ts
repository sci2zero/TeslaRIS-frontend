import axios, { type AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import { type AssessmentResearchArea } from "@/models/AssessmentModel";


export class AssessmentResearchAreaService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async readAssessmentResearchAreas(): Promise<AxiosResponse<AssessmentResearchArea[]>> {
        return super.sendRequest(axios.get, "assessment/research-area");
    }

    async readPersonAssessmentResearchArea(personId: number): Promise<AxiosResponse<AssessmentResearchArea>> {
        return super.sendRequest(axios.get, `assessment/research-area/${personId}`);
    }

    async setPersonAssessmentResearchArea(personId: number, researchAreaCode: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `assessment/research-area/${personId}/${researchAreaCode}`, {}, AssessmentResearchAreaService.idempotencyKey);
    }

    async deletePersonAssessmentResearchArea(personId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/research-area/${personId}`);
    }
}

export default new AssessmentResearchAreaService();
