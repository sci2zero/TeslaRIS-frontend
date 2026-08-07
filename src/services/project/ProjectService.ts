import { BaseService } from "@/services/BaseService";
import axios, { type AxiosResponse } from "axios";
import type { Project, ProjectIndex, ProjectStatus } from "@/models/ProjectModel";
import type { Page } from "@/models/Common";

export class ProjectService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async searchProjects(
        tokens: string,
        onlyActive: boolean = false,
        allowedStatuses: ProjectStatus[] = []
    ): Promise<AxiosResponse<Page<ProjectIndex>>> {
        let url = `project/search?${tokens}`;
        if (onlyActive) {
            url += "&onlyActive=true";
        }
        allowedStatuses.forEach(allowedStatus => {
            url += `&allowedStatuses=${allowedStatus}`;
        });
        return super.sendRequest(axios.get, url);
    }

    async readProject(projectId: number): Promise<AxiosResponse<Project>> {
        if (isNaN(projectId) || projectId <= 0) {
            throw new Error(`Invalid project ID: ${projectId}. Must be a positive integer.`);
        }

        return super.sendRequest(axios.get, `project/${projectId}`);
    }

    async createProject(project: Project): Promise<AxiosResponse<Project>> {
        return super.sendRequest(axios.post, "project", project, ProjectService.idempotencyKey);
    }

    async updateProject(projectId: number, body: Project): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `project/${projectId}`, body);
    }

    async deleteProject(projectId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `project/${projectId}`);
    }

    async canEdit(projectId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `project/${projectId}/can-edit`);
    }
}

export default new ProjectService();
