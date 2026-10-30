import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {Currency, Page} from "@/models/Common";
import i18n from "@/i18n";

export class CurrencyService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    private cachedCurrencies: AxiosResponse<Currency[]> | null = null;

    async getAllCurrencies(): Promise<AxiosResponse<Currency[]>> {
        if (this.cachedCurrencies) {
            return Promise.resolve(this.cachedCurrencies);
        }

        const response = await super.sendRequest(axios.get, "currency");

        this.cachedCurrencies = response;

        return response;
    }

    async searchCurrencies(parameters: string): Promise<AxiosResponse<Page<Currency>>> {
        return super.sendRequest(axios.get, `currency/search?${parameters}&lang=${i18n.vueI18n.global.locale}`);
    }

    async readCurrency(currencyId: number): Promise<AxiosResponse<Currency>> {
        return super.sendRequest(axios.get, `currency/${currencyId}`);
    }

    async createCurrency(body: Currency): Promise<AxiosResponse<Currency>> {
        return super.sendRequest(axios.post, "currency", body, CurrencyService.idempotencyKey);
    }

    async updateCurrency(currencyId: number, body: Currency): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `currency/${currencyId}`, body);
    }

    async deleteCurrency(currencyId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `currency/${currencyId}`);
    }

    invalidateCaches(): void {
        this.cachedCurrencies = null;
    }

}

export default new CurrencyService();
