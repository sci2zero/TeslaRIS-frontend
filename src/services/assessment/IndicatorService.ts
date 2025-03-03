import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { IndicatorRequest, IndicatorResponse } from "@/models/AssessmentModel";
import type { AccessLevel, ApplicableEntityType, Page } from "@/models/Common";
import i18n from "@/i18n";


export class IndicatorService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async fetchAllIndicators(pageable: string): Promise<AxiosResponse<Page<IndicatorResponse>>> {
        return super.sendRequest(axios.get, `assessment/indicator?${pageable}&lang=${i18n.vueI18n.global.locale}`);
    }

    async fetchIndicatorAccessLevel(indicatorId: number): Promise<AxiosResponse<AccessLevel>> {
        return super.sendRequest(axios.get, `assessment/indicator/access-level/${indicatorId}`);
    }

    async fetchIndicatorsForApplicableTypes(entityTypes: ApplicableEntityType[]): Promise<AxiosResponse<IndicatorResponse[]>> {
        let url = "assessment/indicator/list?";
        entityTypes.forEach((entityType, index) => {
            url += `applicableType=${entityType}`
            if (index != entityTypes.length - 1) {
                url += "&"
            }
        });
        
        return super.sendRequest(axios.get, url);
    }

    async deleteIndicator(indicatorId: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.delete, `assessment/indicator/${indicatorId}`);
    }

    async createIndicator(indicator: IndicatorRequest): Promise<AxiosResponse<Page<IndicatorResponse>>> {
        return super.sendRequest(axios.post, "assessment/indicator", indicator, IndicatorService.idempotencyKey);
    }

    async updateIndicator(indicatorId: number, indicator: IndicatorRequest): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.put, `assessment/indicator/${indicatorId}`, indicator);
    }
}

export default new IndicatorService();
