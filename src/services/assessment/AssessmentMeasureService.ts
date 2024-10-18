import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import type { AssessmentMeasure } from "@/models/AssessmentModel";
import type { Page } from "@/models/Common";


export class AssessmentMeasureService extends BaseService {

    async searchAssessmentMeasures(parameters: string): Promise<AxiosResponse<Page<AssessmentMeasure>>> {
        return super.sendRequest(axios.get, `assessment/assessment-measure?${parameters}`);
    }
}

export default new AssessmentMeasureService();
