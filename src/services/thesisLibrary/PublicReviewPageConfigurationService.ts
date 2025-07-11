import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { PublicReviewPageContent } from "@/models/ThesisLibraryModel";
import { ThesisType } from "@/models/PublicationModel";


export class PublicReviewPageConfigurationService extends BaseService {

    async getConfigurationForInstitution(institutionId: number): Promise<AxiosResponse<PublicReviewPageContent[]>> {
        return super.sendRequest(axios.get, `public-review-page-content/for-institution/${institutionId}`);
    }

    async getConfigurationForInstitutionAndThesisTypes(institutionId: number, thesisTypes: ThesisType[]): Promise<AxiosResponse<PublicReviewPageContent[]>> {
        let thesisTypeParam = "";
        thesisTypes.forEach((thesisType, index) => {
            if (index > 0) {
                thesisTypeParam += "&";
            }

            thesisTypeParam += `thesisTypes=${thesisType}`;
        })
        return super.sendRequest(axios.get, `public-review-page-content/for-institution-and-type/${institutionId}?${thesisTypeParam}`);
    }

    async saveConfiguration(body: PublicReviewPageContent[]): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, "public-review-page-content", body);
    }
}

export default new PublicReviewPageConfigurationService();
