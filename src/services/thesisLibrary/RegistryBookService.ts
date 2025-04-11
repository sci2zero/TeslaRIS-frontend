import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { PhdThesisPrePopulatedData, RegistryBookEntry } from "@/models/ThesisLibraryModel";
import { type Page } from "@/models/Common";


export class RegistryBookService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async readRegistryBookEntry(entryId: number): Promise<AxiosResponse<RegistryBookEntry>> {
        return super.sendRequest(axios.get, `registry-book/${entryId}`);
    }

    async getForPromotion(promotionId: number, pageable: string): Promise<AxiosResponse<Page<RegistryBookEntry>>> {
        return super.sendRequest(axios.get, `registry-book/for-promotion/${promotionId}?${pageable}`);
    }

    async getNonPromotedEntries(pageable: string): Promise<AxiosResponse<Page<RegistryBookEntry>>> {
        return super.sendRequest(axios.get, `registry-book/non-promoted?${pageable}`);
    }

    async getEntryPrePopulatedData(thesisId: number): Promise<AxiosResponse<PhdThesisPrePopulatedData>> {
        return super.sendRequest(axios.get, `registry-book/pre-populate/${thesisId}`);
    }

    async createRegistryBookEntry(body: RegistryBookEntry, thesisId: number): Promise<AxiosResponse<RegistryBookEntry>> {
        return super.sendRequest(axios.post, `registry-book/${thesisId}`, body, RegistryBookService.idempotencyKey);
    }

    async updateRegistryBookEntry(body: RegistryBookEntry, entryId: number): Promise<AxiosResponse<RegistryBookEntry>> {
        return super.sendRequest(axios.put, `registry-book/${entryId}`, body);
    }

    async addToPromotion(entryId: number, promotionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `registry-book/add/${entryId}/${promotionId}`, {});
    }

    async removeFromPromotion(entryId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `registry-book/remove/${entryId}`, {});
    }

    async canAddToRegistryBook(thesisId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `registry-book/can-add/${thesisId}`);
    }

    async getAddressList(promotionId: number): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `registry-book/addresses/${promotionId}`);
    }

    async getPromoteesList(promotionId: number): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `registry-book/promotees/${promotionId}`);
    }

    async promoteAll(promotionId: number): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.patch, `registry-book/promote-all/${promotionId}`);
    }

    async cancelAttendance(attendanceIdentifier: string): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `registry-book/cancel-attendance/${attendanceIdentifier}`);
    }
}

export default new RegistryBookService();