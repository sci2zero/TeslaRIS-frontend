import axios, { type AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";
import { type Page } from "@/models/Common";


export class ThesisResearchOutputService extends BaseService {

    async getThesisResearchOutput(thesisId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
      return super.sendRequest(axios.get, `thesis-research-output/${thesisId}?${pageable}`, {});
    }

    async addThesisResearchOutput(thesisId: number, researchOutputId: number): Promise<AxiosResponse<DocumentPublicationIndex>> {
        return super.sendRequest(axios.patch, `thesis-research-output/add/${thesisId}/${researchOutputId}`, {});
    }

    async removeThesisResearchOutput(thesisId: number, researchOutputId: number): Promise<AxiosResponse<DocumentPublicationIndex>> {
        return super.sendRequest(axios.patch, `thesis-research-output/remove/${thesisId}/${researchOutputId}`, {});
    }
}

export default new ThesisResearchOutputService();