import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, ProblemDetails } from '../../types/api.types';
import { environment } from '../../../environments/environment';

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
    
    return this.http.get<any>(fullUrl, options).pipe(
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError(error))
    );
  }

  download(url: string, params?: any): Observable<Blob> {
    const fullUrl = this.getFullUrl(url);
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params),
      responseType: 'blob' as 'json'
    };
    
    return this.http.get<Blob>(fullUrl, options).pipe(
      catchError(error => this.handleError(error))
    );
  }


  post<T>(url: string, data?: any): Observable<T> {
    const fullUrl = this.getFullUrl(url);
    const options = { headers: this.getHeaders() };
    
    return this.http.post<any>(fullUrl, data, options).pipe(
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError(error))
    );
  }

  put<T>(url: string, data?: any): Observable<T> {
    const fullUrl = this.getFullUrl(url);
    const options = { headers: this.getHeaders() };
    
    return this.http.put<any>(fullUrl, data, options).pipe(
      map(response => this.handleResponse<T>(response)),
      catchError(error => this.handleError(error))
    );
  }

  delete<T>(url: string): Observable<T> {
    const fullUrl = this.getFullUrl(url);
    const options = { headers: this.getHeaders() };
    
    return this.http.delete<any>(fullUrl, options).pipe(
      map(response => this.handleResponse<T>(response)),
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

  private handleResponse<T>(response: any): T {
    if (response === null || response === undefined) {
      return response as any;
    }
    
    // If it's explicitly the ApiResponse wrapper format
    if (typeof response === 'object' && response !== null && 'success' in response) {
      if (response.success === true) {
        return response.data as T;
      }
      // If success is false, throw the error provided
      throw new Error(response.error?.message || 'Unknown error occurred');
    }
    
    // Otherwise, treat the entire response as the data (unwrapped format)
    return response as T;
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'Server error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.error) {
      // Server-side error with body
      const errorBody = error.error;
      
      // Try various error message locations
      errorMessage = 
        errorBody.error?.message || 
        errorBody.message || 
        errorBody.detail || 
        errorBody.title || 
        error.message ||
        errorMessage;

      // Handle validation errors (ASP.NET Core ProblemDetails)
      if (errorBody.errors && typeof errorBody.errors === 'object') {
        const validationMessages = Object.entries(errorBody.errors)
          ?.map(([field, messages]) => {
            const fieldMsgs = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${fieldMsgs.join(', ')}`;
          })
          .join('; ');
        if (validationMessages) {
          errorMessage = validationMessages;
        }
      }
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
