import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import { type Page } from "@/models/Common";
import {
    type MigrationFailureResponse,
    type MigrationPipelineResponse,
    type MigrationRunResponse,
    type MigrationScheduleRequest,
    type MigrationStartRequest
} from "@/models/MigrationModel";
import { toUtcTimestamp } from "@/utils/DateUtil";


export class MigrationService extends BaseService {

    async listPipelines(): Promise<AxiosResponse<MigrationPipelineResponse[]>> {
        return super.sendRequest(axios.get, "migrator/pipelines");
    }

    async startRun(source: string, entityType: string, request: MigrationStartRequest): Promise<AxiosResponse<string>> {
        return super.sendRequest(axios.post, `migrator/run?source=${encodeURIComponent(source)}&entityType=${entityType}&performIndex=${request.performIndex}&resume=${request.resume}&backfillOnlyCreated=${request.backfillOnlyCreated}&isUpdate=${request.isUpdate}${request.batchSize ? `&batchSize=${request.batchSize}` : ""}${request.modifiedAfter ? `&modifiedAfter=${encodeURIComponent(request.modifiedAfter)}` : ""}`);
    }

    async scheduleRun(source: string, entityType: string, request: MigrationScheduleRequest): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, `migrator/schedule?source=${encodeURIComponent(source)}&entityType=${entityType}&performIndex=${request.performIndex}&modifiedAfterDays=${request.modifiedAfterDays}&backfillOnlyCreated=${request.backfillOnlyCreated}&isUpdate=${request.isUpdate}&timestamp=${toUtcTimestamp(request.timestamp)}&recurrence=${request.recurrence}${request.batchSize ? `&batchSize=${request.batchSize}` : ""}`);
    }

    async listRuns(source: string | null, entityType: string | null, page: number, size: number): Promise<AxiosResponse<Page<MigrationRunResponse>>> {
        return super.sendRequest(axios.get, `migrator/runs?page=${page}&size=${size}${source ? `&source=${encodeURIComponent(source)}` : ""}${entityType ? `&entityType=${entityType}` : ""}`);
    }

    async getRun(runId: string): Promise<AxiosResponse<MigrationRunResponse>> {
        return super.sendRequest(axios.get, `migrator/runs/${encodeURIComponent(runId)}`);
    }

    async getFailures(runId: string, page: number, size: number): Promise<AxiosResponse<Page<MigrationFailureResponse>>> {
        return super.sendRequest(axios.get, `migrator/runs/${encodeURIComponent(runId)}/failures?page=${page}&size=${size}`);
    }

    async retryFailed(runId: string): Promise<AxiosResponse<string>> {
        return super.sendRequest(axios.post, `migrator/runs/${encodeURIComponent(runId)}/retry-failed`);
    }
}

export default new MigrationService();
