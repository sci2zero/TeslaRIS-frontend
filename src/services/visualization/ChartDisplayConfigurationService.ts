import type { AxiosResponse } from "axios";
import axios from "axios";
import { BaseService } from "../BaseService";
import type { OUChartDisplaySettings, FullChartDisplaySettings, DocumentChartDisplaySettings, PersonChartDisplaySettings } from "@/models/ChartDisplayConfigurationModel";


export class ChartDisplayConfigurationService extends BaseService {

    async getFullChartDisplaySettings(organisationUnitId: number): Promise<AxiosResponse<FullChartDisplaySettings>> {
        return super.sendRequest(axios.get, `chart-display-configuration/base/${organisationUnitId}`);
    }

    async getChartDisplaySettingsForOrganisationUnit(organisationUnitId: number): Promise<AxiosResponse<OUChartDisplaySettings>> {
        return super.sendRequest(axios.get, `chart-display-configuration/organisation-unit/${organisationUnitId}`);
    }

    async getChartDisplaySettingsForPerson(personId: number): Promise<AxiosResponse<PersonChartDisplaySettings>> {
        return super.sendRequest(axios.get, `chart-display-configuration/person/${personId}`);
    }

    async getChartDisplaySettingsForDocument(documentId: number): Promise<AxiosResponse<DocumentChartDisplaySettings>> {
        return super.sendRequest(axios.get, `chart-display-configuration/document/${documentId}`);
    }

    async saveFullChartDisplaySettings(organisationUnitId: number, configuration: FullChartDisplaySettings): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.patch, `chart-display-configuration/base/${organisationUnitId}`, configuration);
    }
}

export default new ChartDisplayConfigurationService();
