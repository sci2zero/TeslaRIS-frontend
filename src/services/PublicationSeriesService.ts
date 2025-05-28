import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";


export class PublicationSeriesService extends BaseService {

    async reorderContribution(publicationSeriesId: number, contributionId: number, oldOrderNumber: number, newOrderNumber: number): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `publication-series/${publicationSeriesId}/reorder-contribution/${contributionId}`, {oldContributionOrderNumber: oldOrderNumber, newContributionOrderNumber: newOrderNumber});
      }
}

export default new PublicationSeriesService();