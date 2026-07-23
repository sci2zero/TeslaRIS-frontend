import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {Project} from "@/models/ProjectModel";

export class ProjectService extends BaseService {

    async readProject(projectId: number): Promise<AxiosResponse<Project>> {
        if (isNaN(projectId) || projectId <= 0) {
            throw new Error(`Invalid project ID: ${projectId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `project/${projectId}`);
    }
}

export default new ProjectService();
