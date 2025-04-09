import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { PhdThesisPrePopulatedData, RegistryBookEntry } from "@/models/ThesisLibraryModel";


export class RegistryBookService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async getEntryPrePopulatedData(thesisId: number): Promise<AxiosResponse<PhdThesisPrePopulatedData>> {
        return super.sendRequest(axios.get, `registry-book/pre-populate/${thesisId}`);
    }

    async createRegistryBookEntry(body: RegistryBookEntry): Promise<AxiosResponse<RegistryBookEntry>> {
        return super.sendRequest(axios.post, "registry-book", body, RegistryBookService.idempotencyKey);
    }
}

export default new RegistryBookService();