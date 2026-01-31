import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PaginatedResponse, SearchParams } from '../../types/api.types';

export abstract class BaseApiService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  constructor(protected apiClient: ApiClientService) {}

  protected abstract getEndpoint(): string;

  getAll(params?: SearchParams): Observable<PaginatedResponse<T>> {
    return this.apiClient.get<PaginatedResponse<T>>(this.getEndpoint(), params as Record<string, unknown> | undefined);
  }

  getById(id: string): Observable<T> {
    return this.apiClient.get<T>(`${this.getEndpoint()}/${id}`);
  }

  create(data: TCreate): Observable<T> {
    return this.apiClient.post<T>(this.getEndpoint(), data);
  }

  update(id: string, data: TUpdate): Observable<T> {
    return this.apiClient.put<T>(`${this.getEndpoint()}/${id}`, data);
  }


  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.getEndpoint()}/${id}`);
  }

  exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(`${this.getEndpoint()}/export-xlsx`);
  }

  exportToPdf(): Observable<Blob> {
    return this.apiClient.download(`${this.getEndpoint()}/export-pdf`);
  }
}
