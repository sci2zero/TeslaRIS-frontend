import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { Page, SearchFieldsResponse } from "@/models/Common";
import type { TermFrequency, DocumentPublicationIndex } from "@/models/PublicationModel";
import type { ThesisSearchRequest } from "@/models/ThesisLibraryModel";
import i18n from "@/i18n";


export class ThesisLibrarySearchService extends BaseService {

    async getSearchFields(onlyExportFields: boolean): Promise<AxiosResponse<SearchFieldsResponse[]>> {
        return super.sendRequest(axios.get, `thesis-library/search/fields?export=${onlyExportFields}`);
    }

    async performSimpleSearch(body: ThesisSearchRequest, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.post, `thesis-library/search/simple?${pageable}`, body);
    }

    async performAdvancedSearch(body: ThesisSearchRequest, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
        return super.sendRequest(axios.post, `thesis-library/search/advanced?${pageable}`, body);
    }

    async performWordCloudSearch(body: ThesisSearchRequest, queryType: "simple" | "advanced"): Promise<AxiosResponse<TermFrequency[]>> {
        return super.sendRequest(axios.post, `thesis-library/search/wordcloud/${queryType}?foreignLanguage=${!i18n.vueI18n.global.locale.toString().toLowerCase().startsWith("sr")}`, body);
    }
}

export default new ThesisLibrarySearchService();
