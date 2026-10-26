import type { AxiosResponse } from "axios";
import { BaseService } from "../BaseService";
import axios from "axios";
import { type FixatorPipeline, type FixatorSummary } from "@/models/RevisionModel";


export class DataQualityFixatorService extends BaseService {

  async listFixators(): Promise<AxiosResponse<FixatorSummary[]>> {
    return super.sendRequest(axios.get, "data-quality-fixator/fixators");
  }

  async listPipelines(): Promise<AxiosResponse<FixatorPipeline[]>> {
    return super.sendRequest(axios.get, "data-quality-fixator/pipelines");
  }

  async createPipeline(pipeline: FixatorPipeline): Promise<AxiosResponse<FixatorPipeline>> {
    return super.sendRequest(axios.post, "data-quality-fixator/pipelines", pipeline);
  }

  async updatePipeline(pipelineName: string, pipeline: FixatorPipeline): Promise<AxiosResponse<FixatorPipeline>> {
    return super.sendRequest(axios.put, `data-quality-fixator/pipelines/${encodeURIComponent(pipelineName)}`, pipeline);
  }

  async deletePipeline(pipelineName: string): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `data-quality-fixator/pipelines/${encodeURIComponent(pipelineName)}`);
  }
}

export default new DataQualityFixatorService();
