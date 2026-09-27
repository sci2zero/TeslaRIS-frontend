import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { BrandingInformation } from "@/models/Common";


export class BrandingService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchBrandingInfo(): Promise<AxiosResponse<BrandingInformation>> {
        return super.sendRequest(axios.get, "branding");
    }

    async updateBrandingInfo(body: BrandingInformation): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, "branding", body);
    }

    async updateLogo(file: File): Promise<AxiosResponse<void>> {
        return super.sendMultipartFormDataRequest(
            axios.patch,
            "branding/logo",
            { file },
            BrandingService.idempotencyKey
        );
    }

    async removeLogo(): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, "branding/logo");
    }

    async updateBackground(file: File): Promise<AxiosResponse<void>> {
        return super.sendMultipartFormDataRequest(
            axios.patch,
            "branding/background",
            { file },
            BrandingService.idempotencyKey
        );
    }

    async removeBackground(): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, "branding/background");
    }
}

export default new BrandingService();
