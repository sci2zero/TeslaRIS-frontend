import type { AxiosResponse } from "axios";
import axios from "axios";
import { type TableExportRequest, type DocumentTableExportRequest, ExportFileFormat, getExtensionForExportFileFormat } from "@/models/Common";
import { BaseService } from "./BaseService";


export class TableExportService extends BaseService {

    async getMaxExportsPerPage(): Promise<AxiosResponse<number>> {
        return super.sendRequest(axios.get, "table-export/records-per-page");
    }

    async exportDocumentTable(body: DocumentTableExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "table-export/documents", body, {responseType: "blob"});
        this.downloadExportFile(response, body.exportFileType);
    }

    async exportPersonTable(body: TableExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "table-export/persons", body, {responseType: "blob"});
        this.downloadExportFile(response, body.exportFileType);
    }

    async exportOrganisationUnitTable(body: TableExportRequest): Promise<void> {
        const response = await axios.post(this.basePath + "table-export/organisation-units", body, {responseType: "blob"});
        this.downloadExportFile(response, body.exportFileType);
    }

    async downloadExportFile(response: AxiosResponse<any, any>, fileFormat: ExportFileFormat) {
        const extension = getExtensionForExportFileFormat(fileFormat);
        this.initialzeDownload(response, `report${extension}`, "");
    }
}

export default new TableExportService();
