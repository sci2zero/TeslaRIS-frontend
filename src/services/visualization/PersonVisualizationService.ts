import type { AxiosResponse } from "axios";
import axios from "axios";
import type { YearlyCounts } from "@/models/Common";
import { BaseService } from "../BaseService";


export class PersonVisualizationService extends BaseService {

    async getPersonPublicationCountsByYear(personId: number): Promise<AxiosResponse<YearlyCounts[]>> {
        return super.sendRequest(axios.get, `visualization-data/person/publication-count/${personId}`);
    }
}

export default new PersonVisualizationService();
