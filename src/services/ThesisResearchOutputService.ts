import axios, { type AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import { DocumentPublicationIndex } from "@/models/PublicationModel";


export class ThesisResearchOutputService extends BaseService {

    async getThesisResearchOutput(thesisId: number): Promise<AxiosResponse<DocumentPublicationIndex>> {
      return super.sendRequest(axios.get, `thesis-research-output/${thesisId}`, {});
    }

    async addThesisResearchOutput(thesisId: number, researchOutputId: number): Promise<AxiosResponse<DocumentPublicationIndex>> {
        return super.sendRequest(axios.patch, `thesis-research-output/add/${thesisId}/${researchOutputId}`, {});
    }

    async removeThesisResearchOutput(thesisId: number, researchOutputId: number): Promise<AxiosResponse<DocumentPublicationIndex>> {
        return super.sendRequest(axios.patch, `thesis-research-output/remove/${thesisId}/${researchOutputId}`, {});
    }
}

export default new ThesisResearchOutputService();