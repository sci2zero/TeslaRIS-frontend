import {BaseService} from "@/services/BaseService";
import axios, {type AxiosResponse} from "axios";
import type {Currency} from "@/models/Common";

export class CurrencyService extends BaseService {

    private cachedCurrencies: AxiosResponse<Currency[]> | null = null;

    async getAllCurrencies(): Promise<AxiosResponse<Currency[]>> {
        if (this.cachedCurrencies) {
            return Promise.resolve(this.cachedCurrencies);
        }

        const response = await super.sendRequest(axios.get, "currency");

        this.cachedCurrencies = response;

        return response;
    }

}

export default new CurrencyService();