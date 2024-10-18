import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { AssessmentRulebook, AssessmentRulebookResponse } from "@/models/AssessmentModel";
import type { Page } from "@/models/Common";


export class AssessmentRulebookService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchAllAssessmentRulebooks(pageable: string): Promise<AxiosResponse<Page<AssessmentRulebookResponse>>> {
        return super.sendRequest(axios.get, `assessment/assessment-rulebook?${pageable}`);
    }

    async deleteAssessmentRulebook(assessmentRulebookId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/assessment-rulebook/${assessmentRulebookId}`);
    }

    async createAssessmentRulebook(assessmentRulebook: AssessmentRulebook): Promise<AxiosResponse<AssessmentRulebook>> {
        return super.sendRequest(axios.post, "assessment/assessment-rulebook", assessmentRulebook, AssessmentRulebookService.idempotencyKey);
    }

    async updateAssessmentRulebook(assessmentRulebookId: number, assessmentRulebook: AssessmentRulebook): Promise<AxiosResponse<AssessmentRulebook>> {
        return super.sendRequest(axios.put, `assessment/assessment-rulebook/${assessmentRulebookId}`, assessmentRulebook);
    }
}

export default new AssessmentRulebookService();
