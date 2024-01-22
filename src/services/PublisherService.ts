import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { Publisher, PublisherIndex } from "@/models/PublisherModel";

export class PublisherService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async searchPublishers(tokens: string): Promise<AxiosResponse<Page<PublisherIndex>>> {
    return super.sendRequest(axios.get, `publisher/simple-search?${tokens}`);
  }

  async createPublisher(body: Publisher): Promise<AxiosResponse<Publisher>> {
    return super.sendRequest(axios.post, "publisher", body, PublisherService.idempotencyKey);
  }

  async deletePublisher(publisherId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `publisher/${publisherId}`);
  }
}

export default new PublisherService();