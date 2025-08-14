import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import { type ScheduledTaskResponse } from "@/models/Common";
import { EntityType } from "@/models/MergeModel";
import { EntityClassificationSource, ReportType, type PublicationAssessmentRequest } from "@/models/AssessmentModel";
import { PublicationType } from "@/models/PublicationModel";

export class TaskSchedulingService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async listScheduledTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
        return super.sendRequest(axios.get, "scheduled-task");
    }

    async listScheduledReportGenerationTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
        return super.sendRequest(axios.get, "scheduled-task/report-generation");
    }

    async listScheduledHarvestTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
        return super.sendRequest(axios.get, "scheduled-task/harvest");
    }

    async listScheduledDocumentBackupTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
        return super.sendRequest(axios.get, "scheduled-task/document-backup");
    }

    async listScheduledThesisLibraryBackupTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
        return super.sendRequest(axios.get, "scheduled-task/thesis-library-backup");
    }

    async listScheduledRegistryBookGenerationTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
        return super.sendRequest(axios.get, "scheduled-task/registry-book-report-generation");
    }

    async scheduleIndicatorLoadingTask(timestamp: string, source: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/publication-series-indicator/schedule-load?timestamp=${timestamp}&source=${source}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleIF5RankComputationTask(timestamp: string, years: number[]): Promise<AxiosResponse<void>> {
        

        return super.sendRequest(axios.post, `assessment/publication-series-indicator/schedule-if5-compute?timestamp=${timestamp}${this.createNumericalParameter("classificationYears", years)}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleClassificationComputationTask(timestamp: string, commissionId: number, years: number[], journalIds: number[]): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/publication-series-assessment-classification/schedule-classification?timestamp=${timestamp}&commissionId=${commissionId}${this.createNumericalParameter("classificationYears", years)}${this.createNumericalParameter("journalIds", journalIds)}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleClassificationLoadTask(timestamp: string, source: EntityClassificationSource, commissionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/publication-series-assessment-classification/schedule-classification-load?timestamp=${timestamp}&source=${source}&commissionId=${commissionId}`, {}, TaskSchedulingService.idempotencyKey);
    }

    async scheduleDatabaseReindexing(timestamp: string, entityTypes: EntityType[], recurrence: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `reindex/schedule?timestamp=${timestamp}&recurrence=${recurrence}`, {indexesToRepopulate: entityTypes}, TaskSchedulingService.idempotencyKey);
    }

    async schedulePublicationAssessment(timestamp: string, dateFrom: string, body: PublicationAssessmentRequest, type: PublicationType): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/document-assessment-classification/schedule-publication-assessment/${type}?timestamp=${timestamp}&dateFrom=${dateFrom}`, body, TaskSchedulingService.idempotencyKey);
    }

    async scheduleReportGeneration(timestamp: string, reportType: ReportType, commissionIds: number[], year: number[] | number, topLevelInstitutionId: number | undefined, lang: string, recurrence: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `assessment/report/schedule-generation?type=${reportType}&year=${year}&lang=${lang}&timestamp=${timestamp}${topLevelInstitutionId ? ("&topLevelInstitutionId=" + topLevelInstitutionId) : ""}${this.createNumericalParameter("commissionId", commissionIds)}&recurrence=${recurrence}`, {}, TaskSchedulingService.idempotencyKey);
    }

    private createNumericalParameter(paramName: string, values: number[]): string {
        let params = "";
        values.forEach(value => {
            params += `&${paramName}=${value}`;
        });
        return params;
    }

    async canceltask(taskId: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `scheduled-task/${taskId}`);
    }
}

export default new TaskSchedulingService();
