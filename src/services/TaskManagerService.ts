import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ScheduledTaskResponse } from "@/models/Common";

export class TaskSchedulingService extends BaseService {

    async listScheduledTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
      return super.sendRequest(axios.get, "scheduled-task");
    }

    async scheduleIndicatorLoadingTask(timestamp: string, source: string): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.post, `assessment/publication-series-indicator/schedule-load?timestamp=${timestamp}&source=${source}`);
    }

    async canceltask(taskId: string): Promise<AxiosResponse<void>> {
      return super.sendRequest(axios.delete, `scheduled-task/${taskId}`);
    }
}

export default new TaskSchedulingService();
