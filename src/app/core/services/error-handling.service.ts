import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  /**
   * Extract error message from API response
   */
  extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return this.extractHttpErrorMessage(error);
    }
    
    if (error && typeof error === 'object' && 'error' in error) {
      return this.extractHttpErrorMessage(error as HttpErrorResponse);
    }
    
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    
    // Plain object with ProblemDetails shape (detail/title/errors)
    if (error && typeof error === 'object' && this.isProblemDetails(error)) {
      return this.extractProblemDetailsMessage(error as ProblemDetails);
    }
    
    return 'An unknown error occurred';
  }

  private extractHttpErrorMessage(error: HttpErrorResponse | { error?: unknown; message?: string }): string {
    type ErrorBody = { error?: { message?: string }; message?: string; detail?: string; title?: string; errors?: Record<string, string[]> };
    const errorBody = ((error as { error?: unknown }).error ?? error) as ErrorBody;
    
    // Handle ProblemDetails format (ASP.NET Core)
    if (this.isProblemDetails(errorBody)) {
      return this.extractProblemDetailsMessage(errorBody as ProblemDetails);
    }
    
    // Handle standard error response
    if (errorBody?.error?.message) {
      return errorBody.error.message;
    }
    
    if (errorBody?.message) {
      return errorBody.message;
    }
    
    if (errorBody?.detail) {
      return errorBody.detail;
    }
    
    if (errorBody?.title) {
      return errorBody.title;
    }
    
    // Handle validation errors
    if (errorBody?.errors && typeof errorBody.errors === 'object') {
      const validationMessages = Object.entries(errorBody.errors)
        .map(([field, messages]) => {
          const fieldMsgs = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${fieldMsgs.join(', ')}`;
        })
        .join('; ');
      
      if (validationMessages) {
        return validationMessages;
      }
    }
    
    // Fallback to status text or default message
    if (error instanceof HttpErrorResponse) {
      return error.statusText || `HTTP ${error.status}: ${error.message}`;
    }
    
    return 'An error occurred while processing your request';
  }

  private extractProblemDetailsMessage(problemDetails: ProblemDetails): string {
    if (problemDetails.detail) {
      return problemDetails.detail;
    }
    
    if (problemDetails.title) {
      return problemDetails.title;
    }
    
    // Handle validation errors in ProblemDetails
    if (problemDetails.errors && typeof problemDetails.errors === 'object') {
      const validationMessages = Object.entries(problemDetails.errors)
        .map(([field, messages]) => {
          const fieldMsgs = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${fieldMsgs.join(', ')}`;
        })
        .join('; ');
      
      if (validationMessages) {
        return validationMessages;
      }
    }
    
    return 'An error occurred';
  }

  private isProblemDetails(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') return false;
    const o = obj as { detail?: string; title?: string; errors?: unknown };
    return (
      typeof o.detail === 'string' ||
      typeof o.title === 'string' ||
      !!(o.errors && typeof o.errors === 'object')
    );
  }

  /**
   * Log error for debugging (in development mode)
   */
  logError(error: unknown, context?: string): void {
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      // Only log in development
      return;
    }
    
    console.error(`[ErrorHandlingService]${context ? ` [${context}]` : ''}:`, error);
  }
}
