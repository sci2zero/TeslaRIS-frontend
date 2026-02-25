import { BaseService } from "../BaseService";
import axios from "axios";
import { getExtensionForExportFileFormat } from "@/models/Common";
import type { ThesisTableExportRequest } from "@/models/ThesisLibraryModel";


export class ThesisLibraryTableExportService extends BaseService {

    async exportThesisLibraryTable(body: ThesisTableExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "thesis-library/table-export", body, {responseType: "blob"});
        const extension = getExtensionForExportFileFormat(body.exportFileType);
        this.initialzeDownload(response, `report${extension}`, extension);
    }
}

export default new ThesisLibraryTableExportService();
