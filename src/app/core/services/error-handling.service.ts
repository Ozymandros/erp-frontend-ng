import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  /**
   * Extract error message from API response
   */
  extractErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      return this.extractHttpErrorMessage(error);
    }
    
    if (error?.error) {
      return this.extractHttpErrorMessage(error);
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'An unknown error occurred';
  }

  private extractHttpErrorMessage(error: HttpErrorResponse | any): string {
    const errorBody = error.error || error;
    
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

  private isProblemDetails(obj: any): boolean {
    return obj && (
      typeof obj.detail === 'string' ||
      typeof obj.title === 'string' ||
      (obj.errors && typeof obj.errors === 'object')
    );
  }

  /**
   * Log error for debugging (in development mode)
   */
  logError(error: any, context?: string): void {
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      // Only log in development
      return;
    }
    
    console.error(`[ErrorHandlingService]${context ? ` [${context}]` : ''}:`, error);
  }
}
