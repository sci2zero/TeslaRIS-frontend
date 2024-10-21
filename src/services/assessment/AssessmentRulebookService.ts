import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { AssessmentMeasure, AssessmentRulebook, AssessmentRulebookResponse } from "@/models/AssessmentModel";
import type { Page } from "@/models/Common";
import { License, ResourceType, type DocumentFileResponse } from "@/models/DocumentFileModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";


export class AssessmentRulebookService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchAllAssessmentRulebooks(pageable: string): Promise<AxiosResponse<Page<AssessmentRulebookResponse>>> {
        return super.sendRequest(axios.get, `assessment/assessment-rulebook?${pageable}`);
    }

    async getAssessmentMeasuresForRulebook(rulebookId: number, pageable: string): Promise<AxiosResponse<Page<AssessmentMeasure>>> {
        return super.sendRequest(axios.get, `assessment/assessment-rulebook/${rulebookId}/measures?${pageable}`);
    }

    async readAssessmentRulebook(assessmentRulebookId: number): Promise<AxiosResponse<AssessmentRulebookResponse>> {
        return super.sendRequest(axios.get, `assessment/assessment-rulebook/${assessmentRulebookId}`);
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

    async addAssessmentRulebookFileAttachment(assessmentRulebookId: number, attachment: any): Promise<AxiosResponse<DocumentFileResponse>> {
        if (typeof attachment.license === "number") {
            attachment.license = getNameFromOrdinal(License, attachment.license);
        }
        if (typeof attachment.resourceType === "number") {
            attachment.resourceType = getNameFromOrdinal(ResourceType, attachment.resourceType);
        }
        return super.sendMultipartFormDataRequest(axios.patch, `assessment/assessment-rulebook/${assessmentRulebookId}`, attachment, AssessmentRulebookService.idempotencyKey);
    }

    async deleteAssessmentRulebookFileAttachment(assessmentRulebookId: number, documentFileId: number): Promise<void> {
        return super.sendRequest(axios.delete, `assessment/assessment-rulebook/${assessmentRulebookId}/${documentFileId}`);
    }
}

export default new AssessmentRulebookService();
