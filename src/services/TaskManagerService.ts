import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ScheduledTaskResponse } from "@/models/Common";
import { EntityType } from "@/models/MergeModel";
import { EntityClassificationSource, type JournalPublicationAssessmentRequest } from "@/models/AssessmentModel";

export class TaskSchedulingService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async listScheduledTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
        return super.sendRequest(axios.get, "scheduled-task");
    }

    async scheduleIndicatorLoadingTask(timestamp: string, source: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/publication-series-indicator/schedule-load?timestamp=${timestamp}&source=${source}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleIF5RankComputationTask(timestamp: string, years: number[]): Promise<AxiosResponse<void>> {
        

        return super.sendRequest(axios.post, `assessment/publication-series-indicator/schedule-if5-compute?timestamp=${timestamp}${this.createClassificationYearsParameter(years)}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleClassificationComputationTask(timestamp: string, commissionId: number, years: number[]): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/publication-series-assessment-classification/schedule-classification?timestamp=${timestamp}&commissionId=${commissionId}${this.createClassificationYearsParameter(years)}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleClassificationLoadTask(timestamp: string, source: EntityClassificationSource, commissionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/publication-series-assessment-classification/schedule-classification-load?timestamp=${timestamp}&source=${source}&commissionId=${commissionId}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleDatabaseReindexing(timestamp: string, entityTypes: EntityType[]): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `reindex/schedule?timestamp=${timestamp}`, {indexesToRepopulate: entityTypes}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleJournalPublicationAssessment(timestamp: string, dateFrom: string, body: JournalPublicationAssessmentRequest): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/document-assessment-classification/schedule-journal-publication-assessment?timestamp=${timestamp}&dateFrom=${dateFrom}`, body, TaskSchedulingService.idempotencyKey);
    }

    private createClassificationYearsParameter(years: number[]): string {
        let classificationYears = "";
        years.forEach(year => {
            classificationYears += `&classificationYears=${year}`;
        });
        return classificationYears;
    }

    async canceltask(taskId: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `scheduled-task/${taskId}`);
    }
}

export default new TaskSchedulingService();
