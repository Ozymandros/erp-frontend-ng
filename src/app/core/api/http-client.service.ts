import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, ProblemDetails } from '@/app/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private authToken: string | null = null;

  constructor(private http: HttpClient) {}

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  get<T>(url: string, params?: any): Observable<T> {
    const options = {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    };
    
    return this.http.get<ApiResponse<T>>(url, options).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  post<T>(url: string, data?: any): Observable<T> {
    const options = { headers: this.getHeaders() };
    
    return this.http.post<ApiResponse<T>>(url, data, options).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  put<T>(url: string, data?: any): Observable<T> {
    const options = { headers: this.getHeaders() };
    
    return this.http.put<ApiResponse<T>>(url, data, options).pipe(
      map(response => this.handleResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  delete<T>(url: string): Observable<T> {
    const options = { headers: this.getHeaders() };
    
    return this.http.delete<ApiResponse<T>>(url, options).pipe(
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
