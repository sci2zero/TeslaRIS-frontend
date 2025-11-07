import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CollaborationNetwork, CollaborationType, Page } from "@/models/Common";
import { BaseService } from "../BaseService";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";


export class CollaborationNetworkService extends BaseService {

    async getPersonCollaborationNetwork(personId: number, collaborationType: CollaborationType, depth: number, yearFrom: number, yearTo: number): Promise<AxiosResponse<CollaborationNetwork>> {
        return super.sendRequest(axios.get, `collaboration-network/${personId}?collaborationType=${collaborationType}&depth=${depth}&yearFrom=${yearFrom}&yearTo=${yearTo}`);
    }

    async getPublicationsForCollaboration(sourcePersonId: number, targetPersonId: number, collaborationType: CollaborationType, yearFrom: number, yearTo: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.get, `collaboration-network/works/${sourcePersonId}/${targetPersonId}?collaborationType=${collaborationType}&yearFrom=${yearFrom}&yearTo=${yearTo}${pageable}`);
    }
}

export default new CollaborationNetworkService();
