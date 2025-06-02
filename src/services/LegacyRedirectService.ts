import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { DocumentFileNavigationDetails, EntityNavigationDetails } from "@/models/Common";


export class LegacyRedirectService extends BaseService {

    async getEntityNavigationDetails(oldId: number, source: string, language: string): Promise<AxiosResponse<EntityNavigationDetails>> {
        return super.sendRequest(axios.get, `legacy-navigation/entity-landing-page/${oldId}?source=${source}&language=${language}`);
    }

    async getDocumentFileNavigationDetails(oldServerFilename: string, source: string, language: string): Promise<AxiosResponse<DocumentFileNavigationDetails>> {
        return super.sendRequest(axios.get, `legacy-navigation/document-file/${oldServerFilename}?source=${source}&language=${language}`);
    }
}

export default new LegacyRedirectService();
