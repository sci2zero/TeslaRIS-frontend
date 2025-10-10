import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CollaborationNetwork, CollaborationType, Page } from "@/models/Common";
import { BaseService } from "../BaseService";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";


export class CollaborationNetworkService extends BaseService {

    async getPersonCollaborationNetwork(personId: number, collaborationType: CollaborationType, depth: number): Promise<AxiosResponse<CollaborationNetwork>> {
        return super.sendRequest(axios.get, `collaboration-network/${personId}?collaborationType=${collaborationType}&depth=${depth}`);
    }

    async getPublicationsForCollaboration(sourcePersonId: number, targetPersonId: number, collaborationType: CollaborationType, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.get, `collaboration-network/works/${sourcePersonId}/${targetPersonId}?collaborationType=${collaborationType}${pageable}`);
    }
}

export default new CollaborationNetworkService();
