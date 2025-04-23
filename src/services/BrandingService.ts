import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { BrandingInformation } from "@/models/Common";


export class BrandingService extends BaseService {

    public cachedBrandingInformation: AxiosResponse<BrandingInformation> | null = null;


    async fetchBrandingInfo(): Promise<AxiosResponse<BrandingInformation>> {
        if (this.cachedBrandingInformation) {
            return Promise.resolve(this.cachedBrandingInformation);
        }
        
        return super.sendRequest(axios.get, "branding");
    }

    async updateBrandingInfo(body: BrandingInformation): Promise<AxiosResponse<void>> {
        this.cachedBrandingInformation = null;
        return super.sendRequest(axios.put, "branding", body);
    }
}

export default new BrandingService();
