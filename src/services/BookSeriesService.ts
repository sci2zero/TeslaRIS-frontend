import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { BookSeries, BookSeriesIndex } from "@/models/BookSeriesModel";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";

export class BookSeriesService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async searchBookSeries(tokens: string): Promise<AxiosResponse<Page<BookSeriesIndex>>> {
    return super.sendRequest(axios.get, `book-series/simple-search?${tokens}`);
  }

  async createBookSeries(body: BookSeries): Promise<AxiosResponse<PublicationSeries>> {
    return super.sendRequest(axios.post, "book-series", body, BookSeriesService.idempotencyKey);
  }

  async deleteBookSeries(bookSeriesId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `book-series/${bookSeriesId}`);
  }
}

export default new BookSeriesService();