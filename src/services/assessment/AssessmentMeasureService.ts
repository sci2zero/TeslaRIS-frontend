import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { AssessmentMeasure } from "@/models/AssessmentModel";
import type { Page } from "@/models/Common";


export class AssessmentMeasureService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async searchAssessmentMeasures(parameters: string): Promise<AxiosResponse<Page<AssessmentMeasure>>> {
        return super.sendRequest(axios.get, `assessment/assessment-measure?${parameters}`);
    }

    async createAssessmentMeasure(body: AssessmentMeasure): Promise<AxiosResponse<AssessmentMeasure>> {
        return super.sendRequest(axios.post, "assessment/assessment-measure", body, AssessmentMeasureService.idempotencyKey);
    }

    async updateAssessmentMeasure(assessmentMeasureId: number, body: AssessmentMeasure): Promise<AxiosResponse<Page<AssessmentMeasure>>> {
        return super.sendRequest(axios.put, `assessment/assessment-measure/${assessmentMeasureId}`, body);
    }

    async deleteAssessmentMeasure(assessmentMeasureId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/assessment-measure/${assessmentMeasureId}`);
    }
}

export default new AssessmentMeasureService();
