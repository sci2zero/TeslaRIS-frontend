import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { AttendanceCancellationRequest, InstitutionPromotionCountsReport, PhdThesisPrePopulatedData, RegistryBookEntry } from "@/models/ThesisLibraryModel";
import { type Page } from "@/models/Common";
import i18n from "@/i18n";


export class RegistryBookService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async readRegistryBookEntry(entryId: number): Promise<AxiosResponse<RegistryBookEntry>> {
        return super.sendRequest(axios.get, `registry-book/${entryId}`);
    }

    async getForPromotion(promotionId: number, pageable: string): Promise<AxiosResponse<Page<RegistryBookEntry>>> {
        return super.sendRequest(axios.get, `registry-book/for-promotion/${promotionId}?${pageable}`);
    }

    async getPromoted(institutionId: number, from: string, to: string, authorName: string, authorTitle: string, pageable: string): Promise<AxiosResponse<Page<RegistryBookEntry>>> {
        return super.sendRequest(axios.get, `registry-book/promoted/${institutionId}?from=${from}&to=${to}&authorName=${authorName}&authorTitle=${authorTitle}&${pageable}`);
    }

    async getPromotedCounts(from: string, to: string): Promise<AxiosResponse<InstitutionPromotionCountsReport[]>> {
        return super.sendRequest(axios.get, `registry-book/count-report?from=${from}&to=${to}`);
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

    async canAddToRegistryBook(thesisId: number): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.get, `registry-book/can-add/${thesisId}`);
    }

    async getAddressList(promotionId: number): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `registry-book/addresses/${promotionId}`);
    }

    async getPromoteesList(promotionId: number): Promise<AxiosResponse<string[]>> {
        return super.sendRequest(axios.get, `registry-book/promotees/${promotionId}`);
    }

    async previewPromoteAll(promotionId: number): Promise<AxiosResponse<string[][]>> {
        return super.sendRequest(axios.patch, `registry-book/preview-promote-all/${promotionId}?lang=${i18n.vueI18n.global.locale}`);
    }

    async promoteAll(promotionId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `registry-book/promote-all/${promotionId}`);
    }

    async cancelAttendance(body: AttendanceCancellationRequest): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `registry-book/cancel-attendance`, body);
    }

    async isAttendanceCancellable(attendanceIdentifier: string): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `registry-book/is-attendance-cancellable/${attendanceIdentifier}`);
    }

    async deleteRegistryBookEntry(entryId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `registry-book/${entryId}`);
    }

    async canEdit(entryId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `registry-book/can-edit/${entryId}`);
    }

    async canAllowSingleEdit(entryId: number): Promise<AxiosResponse<boolean>> {
        return super.sendRequest(axios.get, `registry-book/can-allow-single-edit/${entryId}`);
    }

    async allowSingleUpdate(entryId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `registry-book/allow-single-update/${entryId}`);
    }

    async getDraft(thesisId: number): Promise<AxiosResponse<RegistryBookEntry>> {
        return super.sendRequest(axios.get, `registry-book-draft/${thesisId}`);
    }

    async saveDraft(body: RegistryBookEntry, thesisId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `registry-book-draft/${thesisId}`, body, RegistryBookService.idempotencyKey);
    }
}

export default new RegistryBookService();