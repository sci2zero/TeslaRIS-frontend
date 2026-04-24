import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { AccessLevel, ApplicableEntityType, Page } from "@/models/Common";
import type { Identifier, IdentifierResponse } from "@/models/IdentifierModel";
import i18n from "@/i18n";


export class IdentifierService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();


    async fetchIdentifiersForApplicableTypes(entityTypes: ApplicableEntityType[]): Promise<AxiosResponse<IdentifierResponse[]>> {
        let url = "identifier/list?";
        entityTypes.forEach((entityType, index) => {
            url += `applicableType=${entityType}`
            if (index != entityTypes.length - 1) {
                url += "&"
            }
        });
        
        return super.sendRequest(axios.get, url);
    }

    async fetchAllIdentifiers(pageable: string): Promise<AxiosResponse<Page<IdentifierResponse>>> {
        return super.sendRequest(axios.get, `identifier?${pageable}&lang=${i18n.vueI18n.global.locale}`);
    }

    async fetchIdentifierAccessLevel(identifierId: number): Promise<AxiosResponse<AccessLevel>> {
        return super.sendRequest(axios.get, `identifier/access-level/${identifierId}`);
    }

    async deleteIdentifier(identifierId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `identifier/${identifierId}`);
    }

    async createIdentifier(identifier: Identifier): Promise<AxiosResponse<Page<IdentifierResponse>>> {
        return super.sendRequest(axios.post, "identifier", identifier, IdentifierService.idempotencyKey);
    }

    async updateIdentifier(identifierId: number, identifier: Identifier): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `identifier/${identifierId}`, identifier);
    }
}

export default new IdentifierService();
