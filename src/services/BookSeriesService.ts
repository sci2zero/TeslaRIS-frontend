import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Page } from "@/models/Common";
import type { BookSeries, BookSeriesIndex } from "@/models/BookSeriesModel";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";

export class BookSeriesService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async searchBookSeries(tokens: string): Promise<AxiosResponse<Page<BookSeriesIndex>>> {
    return super.sendRequest(axios.get, `book-series/simple-search?${tokens}`);
  }

  async readBookSeries(bookSeriesId: number): Promise<AxiosResponse<BookSeries>> {
    return super.sendRequest(axios.get, `book-series/${bookSeriesId}`);
  }

  async createBookSeries(body: BookSeries): Promise<AxiosResponse<PublicationSeries>> {
    return super.sendRequest(axios.post, "book-series", body, BookSeriesService.idempotencyKey);
  }

  async updateBookSeries(bookSeriesId: number, updatedBookSeries: BookSeries): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `book-series/${bookSeriesId}`, updatedBookSeries);
  }

  async deleteBookSeries(bookSeriesId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `book-series/${bookSeriesId}`);
  }

  async forceDeleteBookSeries(bookSeriesId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `book-series/force/${bookSeriesId}`);
  }

  async canEdit(bookSeriesId: number): Promise<AxiosResponse<boolean>> {
    return super.sendRequest(axios.get, `book-series/${bookSeriesId}/can-edit`);
  }

  async findPublicationsForBookSeries(bookSeriesId: number, pageable: string): Promise<AxiosResponse<Page<DocumentPublicationIndex>>> {
    return super.sendRequest(axios.get, `book-series/publications/${bookSeriesId}?${pageable}`);
  }
}

export default new BookSeriesService();