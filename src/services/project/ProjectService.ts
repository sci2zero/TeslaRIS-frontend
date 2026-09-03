import { BaseService } from "@/services/BaseService";
import axios, { type AxiosResponse } from "axios";
import type { OrganisationUnitProjectContribution, PersonProjectContribution, Project, ProjectDocument, ProjectEvent, ProjectIndex, ProjectStatus } from "@/models/ProjectModel";
import type { Page } from "@/models/Common";

export class ProjectService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async searchProjects(
        tokens: string,
        onlyActive: boolean = false,
        onlyWithoutContributions: boolean = false,
        allowedStatuses: ProjectStatus[] = []
    ): Promise<AxiosResponse<Page<ProjectIndex>>> {
        let url = `project/search?${tokens}`;
        if (onlyActive) {
            url += "&onlyActive=true";
        }
        if (onlyWithoutContributions) {
            url += "&onlyWithoutContributions=true";
        }
        allowedStatuses.forEach(allowedStatus => {
            url += `&allowedStatuses=${allowedStatus}`;
        });
        return super.sendRequest(axios.get, url);
    }

    async getProjectCount(): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.get, "project/count");
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

    async addProjectPerson(projectId: number, personContribution: PersonProjectContribution): Promise<AxiosResponse<PersonProjectContribution>> {
        return super.sendRequest(axios.post, `project/${projectId}/add-person`, personContribution, ProjectService.idempotencyKey);
    }

    async removeProjectPerson(projectId: number, personContributionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `project/${projectId}/remove-person/${personContributionId}`);
    }

    async addProjectOrganisation(projectId: number, organisationContribution: OrganisationUnitProjectContribution): Promise<AxiosResponse<OrganisationUnitProjectContribution>> {
        return super.sendRequest(axios.post, `project/${projectId}/add-organisation`, organisationContribution, ProjectService.idempotencyKey);
    }

    async removeProjectOrganisation(projectId: number, organisationContributionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `project/${projectId}/remove-organisation/${organisationContributionId}`);
    }

    async readProjectDocuments(projectId: number): Promise<AxiosResponse<ProjectDocument[]>> {
        return super.sendRequest(axios.get, `project/${projectId}/documents`);
    }

    async addProjectDocument(projectDocument: ProjectDocument): Promise<AxiosResponse<ProjectDocument>> {
        return super.sendRequest(axios.post, "project/add-document", projectDocument, ProjectService.idempotencyKey);
    }

    async removeProjectDocument(projectDocumentId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `project/remove-document/${projectDocumentId}`);
    }

    async readProjectEvents(projectId: number): Promise<AxiosResponse<ProjectEvent[]>> {
        return super.sendRequest(axios.get, `project/${projectId}/events`);
    }

    async addProjectEvent(projectEvent: ProjectEvent): Promise<AxiosResponse<ProjectEvent>> {
        return super.sendRequest(axios.post, "project/add-event", projectEvent, ProjectService.idempotencyKey);
    }

    async removeProjectEvent(projectEventId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `project/remove-event/${projectEventId}`);
    }
}

export default new ProjectService();
