import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ScheduledTaskResponse } from "@/models/Common";

export class TaskSchedulingService extends BaseService {

    async listScheduledTasks(): Promise<AxiosResponse<ScheduledTaskResponse[]>> {
      return super.sendRequest(axios.get, "scheduled-task");
    }
}

export default new TaskSchedulingService();
