import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { ExternalIndicatorConfiguration } from "@/models/AssessmentModel";


export class ExternalIndicatorConfigurationService extends BaseService {

    async readConfigurationForInstitution(institutionId: number): Promise<AxiosResponse<ExternalIndicatorConfiguration>> {
        return super.sendRequest(axios.get, `external-indicator-configuration/institution/${institutionId}`);
    }

    async readConfigurationForDocument(documentId: number): Promise<AxiosResponse<ExternalIndicatorConfiguration>> {
        return super.sendRequest(axios.get, `external-indicator-configuration/document/${documentId}`);
    }

    async updateIndicatorConfiguration(body: ExternalIndicatorConfiguration, institutionId: number): Promise<AxiosResponse<ExternalIndicatorConfiguration>> {
        return super.sendRequest(axios.patch, `external-indicator-configuration/${institutionId}`, body);
    }
}

export default new ExternalIndicatorConfigurationService();
