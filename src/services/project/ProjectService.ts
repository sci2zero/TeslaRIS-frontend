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

    async updateProject(projectId: number, body: Project): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `project/${projectId}`, body);
    }

    async canEdit(projectId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `project/${projectId}/can-edit`);
    }
}

export default new ProjectService();
