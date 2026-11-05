import { type RecurrenceType } from "./LoadModel";


export enum MigrationRunStatus {
    RUNNING = "RUNNING",
    FINISHED = "FINISHED",
    FAILED = "FAILED"
}

export interface MigrationPipelineResponse {
    source: string;
    entityType: string;
    defaultBatchSize: number;
    running: boolean;
}

export interface MigrationRunResponse {
    runId: string;
    source: string;
    entityType: string;
    status: MigrationRunStatus;
    startedAt: string;
    finishedAt: string | null;
    currentPage: number;
    recordsRead: number;
    itemsCreated: number;
    itemsUpdated: number;
    itemsResolved: number;
    itemsSkipped: number;
    itemsFailed: number;
    batchesFailed: number;
}

export interface MigrationFailureResponse {
    entityType: string;
    sourceKey: string;
    reason: string;
    processedAt: string;
}

export interface MigrationStartRequest {
    batchSize: number | null;
    performIndex: boolean;
    resume: boolean;
    modifiedAfter: string | null;
    backfillOnlyCreated: boolean;
    isUpdate: boolean;
}

export interface MigrationScheduleRequest {
    batchSize: number | null;
    performIndex: boolean;
    modifiedAfterDays: number;
    backfillOnlyCreated: boolean;
    isUpdate: boolean;
    timestamp: string;
    recurrence: RecurrenceType;
}
