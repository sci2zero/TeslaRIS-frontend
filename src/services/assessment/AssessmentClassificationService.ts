import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { AssessmentClassification } from "@/models/AssessmentModel";
import type { ApplicableEntityType, Page } from "@/models/Common";
import i18n from "@/i18n";


export class AssessmentClassificationService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchAllAssessmentClassifications(pageable: string): Promise<AxiosResponse<Page<AssessmentClassification>>> {
        return super.sendRequest(axios.get, `assessment/assessment-classification?${pageable}&lang=${i18n.vueI18n.global.locale}`);
    }

    async fetchAllAssessmentClassificationsForApplicableType(entityTypes: ApplicableEntityType[]): Promise<AxiosResponse<AssessmentClassification[]>> {
        let url = "assessment/assessment-classification/list?";
        entityTypes.forEach((entityType, index) => {
            url += `applicableType=${entityType}`
            if (index != entityTypes.length - 1) {
                url += "&"
            }
        });

        return super.sendRequest(axios.get, url);
    }

    async deleteAssessmentClassification(assessmentClassificationId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/assessment-classification/${assessmentClassificationId}`);
    }

    async createAssessmentClassification(assessmentClassification: AssessmentClassification): Promise<AxiosResponse<Page<AssessmentClassification>>> {
        return super.sendRequest(axios.post, "assessment/assessment-classification", assessmentClassification, AssessmentClassificationService.idempotencyKey);
    }

    async updateAssessmentClassification(assessmentClassificationId: number, assessmentClassification: AssessmentClassification): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/assessment-classification/${assessmentClassificationId}`, assessmentClassification);
    }
}

export default new AssessmentClassificationService();
