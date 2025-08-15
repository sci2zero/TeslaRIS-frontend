import { BaseService } from "../BaseService";
import axios from "axios";
import { ExportFileFormat } from "@/models/Common";
import type { ThesisCSVExportRequest } from "@/models/ThesisLibraryModel";


export class ThesisLibraryCSVExportService extends BaseService {

    async exportThesisLibraryTable(body: ThesisCSVExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "thesis-library/csv-export", body, {responseType: 'blob'});
        const extension = body.exportFileType === ExportFileFormat.CSV ? ".csv" : ".xlsx";
        this.initialzeDownload(response, `report${extension}`, extension);
    }
}

export default new ThesisLibraryCSVExportService();
