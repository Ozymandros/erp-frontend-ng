import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, ProblemDetails } from '@/app/types/api.types';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private authToken: string | null = null;
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private getFullUrl(url: string): string {
    if (url.startsWith('http') || !this.baseUrl) {
      return url;
    }
    // Avoid double slashes if baseUrl has one and url has one
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  }

  get<T>(url: string, params?: any): Observable<T> {
    const fullUrl = this.getFullUrl(url);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };
    
    return this.http.get<ApiResponse<T>>(fullUrl, options).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }


  post<T>(url: string, data?: any): Observable<T> {
    const fullUrl = this.getFullUrl(url);
    const options = { headers: this.getHeaders() };
    
    return this.http.post<ApiResponse<T>>(fullUrl, data, options).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  put<T>(url: string, data?: any): Observable<T> {
    const fullUrl = this.getFullUrl(url);
    const options = { headers: this.getHeaders() };
    
    return this.http.put<ApiResponse<T>>(fullUrl, data, options).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  delete<T>(url: string): Observable<T> {
    const fullUrl = this.getFullUrl(url);
    const options = { headers: this.getHeaders() };
    
    return this.http.delete<ApiResponse<T>>(fullUrl, options).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.authToken) {
      headers = headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    return headers;
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response) {
      return null as any;
    }
    if (response.success) {
      return response.data as T;
    }
    throw new Error(response.error?.message || 'Unknown error occurred');
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return throwError(() => new Error(error.error.message));
    } else {
      // Server-side error
      const problemDetails: ProblemDetails = error.error;
      const message = problemDetails?.detail || error.message || 'Server error occurred';
      return throwError(() => new Error(message));
    }
  }
}
