import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Country, Page } from "@/models/Common";
import i18n from "@/i18n";


export class CountryService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  public cachedCountries: AxiosResponse<Country[]> | null = null;


  async searchCountries(parameters: string): Promise<AxiosResponse<Page<Country>>> {
    return super.sendRequest(axios.get, `country/search?${parameters}&lang=${i18n.vueI18n.global.locale}`);
  }

  async readCountry(countryId: number): Promise<AxiosResponse<Country>> {
    return super.sendRequest(axios.get, `country/${countryId}`);
  }

  async createCountry(body: Country): Promise<AxiosResponse<Country>> {
    return super.sendRequest(axios.post, "country", body, CountryService.idempotencyKey);
  }

  async updateCountry(countryId: number, body: Country): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.put, `country/${countryId}`, body);
  }

  async deleteCountry(countryId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `country/${countryId}`);
  }

  async readAllCountries(): Promise<AxiosResponse<Country[]>> {
    if (this.cachedCountries) {
      return Promise.resolve({
        ...this.cachedCountries,
        data: this.sortCountriesByLocale(this.cachedCountries.data)
      });
    }
  
    const response = await super.sendRequest(axios.get, "country");
    response.data = this.sortCountriesByLocale(response.data);
    this.cachedCountries = response;
    return response;
  }
  
  private sortCountriesByLocale(countries: Country[]): Country[] {
    const locale = i18n.vueI18n.global.locale;
  
    return [...countries].sort((a, b) => {
      const aName = a.name.find(n => n.languageTag.toLowerCase() === locale)?.content || "";
      const bName = b.name.find(n => n.languageTag.toLowerCase() === locale)?.content || "";
      return aName.localeCompare(bName);
    });
  }

  invalidateCaches(): void {
    this.cachedCountries = null;
  }
}

export default new CountryService();
