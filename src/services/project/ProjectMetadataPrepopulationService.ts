import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { PrepopulatedProjectMetadata } from "@/models/ProjectModel";


export class ProjectMetadataPrepopulationService extends BaseService {

    async fetchProjectDataForDoi(doi: string): Promise<AxiosResponse<PrepopulatedProjectMetadata>> {
        return super.sendRequest(axios.get, `project-metadata-prepopulation?doi=${doi}`);
    }
}

export default new ProjectMetadataPrepopulationService();
