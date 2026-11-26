import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import type {
  CreateExchangeRateDto,
  CreateUpdateCurrencyDto,
  CurrencyDto,
  ExchangeRateDto,
} from '../../types/projects.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectCurrenciesService {
  constructor(private readonly apiClient: ApiClientService) {}

  list(): Observable<CurrencyDto[]> {
    return this.apiClient.get<CurrencyDto[]>(PROJECTS_ENDPOINTS.CURRENCIES);
  }

  getByCode(code: string): Observable<CurrencyDto> {
    return this.apiClient.get<CurrencyDto>(PROJECTS_ENDPOINTS.CURRENCY_BY_CODE(code));
  }

  create(dto: CreateUpdateCurrencyDto): Observable<CurrencyDto> {
    return this.apiClient.post<CurrencyDto>(PROJECTS_ENDPOINTS.CURRENCIES, dto);
  }

  update(code: string, dto: CreateUpdateCurrencyDto): Observable<CurrencyDto> {
    return this.apiClient.put<CurrencyDto>(PROJECTS_ENDPOINTS.CURRENCY_BY_CODE(code), dto);
  }

  delete(code: string): Observable<void> {
    return this.apiClient.delete<void>(PROJECTS_ENDPOINTS.CURRENCY_BY_CODE(code));
  }

  addExchangeRate(code: string, dto: CreateExchangeRateDto): Observable<ExchangeRateDto> {
    return this.apiClient.post<ExchangeRateDto>(
      PROJECTS_ENDPOINTS.CURRENCY_EXCHANGE_RATES(code),
      dto,
    );
  }

  deleteExchangeRate(code: string, rateId: string): Observable<void> {
    return this.apiClient.delete<void>(
      PROJECTS_ENDPOINTS.CURRENCY_EXCHANGE_RATE_BY_ID(code, rateId),
    );
  }

  getRate(code: string, date?: string): Observable<number> {
    const params = date ? { date } : undefined;
    return this.apiClient.get<number>(PROJECTS_ENDPOINTS.CURRENCY_RATE(code), params);
  }

  exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.CURRENCIES_EXPORT_XLSX);
  }

  exportToPdf(): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.CURRENCIES_EXPORT_PDF);
  }
}
