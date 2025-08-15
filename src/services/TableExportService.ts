import type { AxiosResponse } from "axios";
import axios from "axios";
import { type CSVExportRequest, type DocumentCSVExportRequest, ExportFileFormat } from "@/models/Common";
import { BaseService } from "./BaseService";


export class TableExportService extends BaseService {

    async getMaxExportsPerPage(): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.get, "csv-export/records-per-page");
    }

    async exportDocumentTable(body: DocumentCSVExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "csv-export/documents", body, {responseType: 'blob'});
        this.downloadExportFile(response, body.exportFileType);
    }

    async exportPersonTable(body: CSVExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "csv-export/persons", body, {responseType: 'blob'});
        this.downloadExportFile(response, body.exportFileType);
    }

    async exportOrganisationUnitTable(body: CSVExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "csv-export/organisation-units", body, {responseType: 'blob'});
        this.downloadExportFile(response, body.exportFileType);
    }

    async downloadExportFile(response: AxiosResponse<any, any>, fileType: ExportFileFormat) {
        const extension = fileType === ExportFileFormat.CSV ? ".csv" : ".xlsx";
        this.initialzeDownload(response, `report${extension}`, extension);
    }
}

export default new TableExportService();
