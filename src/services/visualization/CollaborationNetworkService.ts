import type { AxiosResponse } from "axios";
import axios from "axios";
import type { CollaborationNetwork } from "@/models/Common";
import { BaseService } from "../BaseService";


export class CollaborationNetworkService extends BaseService {

    async getPersonCollaborationNetwork(personId: number): Promise<AxiosResponse<CollaborationNetwork>> {
        return super.sendRequest(axios.get, `collaboration-network/${personId}`);
    }
}

export default new CollaborationNetworkService();
