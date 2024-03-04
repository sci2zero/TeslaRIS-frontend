import { BaseService } from "./BaseService";
import axios from "axios";

export class DocumentFileService extends BaseService {

    async downloadDocumentFile(serverFilename: string, fileName: string, extension: string): Promise<void> {
        const response = await super.sendRequest(axios.get, `file/${serverFilename}`, {
            responseType: 'blob',
        });
        this.initialzeDownload(response, fileName, extension);
    }
}

export default new DocumentFileService();