import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from './error-handling.service';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlingService]
    });
    service = TestBed.inject(ErrorHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should extract message from HttpErrorResponse with error body', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { message: 'Bad request' }
    });
    expect(service.extractErrorMessage(err)).toBe('Bad request');
  });

  it('should extract message from error object with message property', () => {
    expect(service.extractErrorMessage(new Error('Something failed'))).toBe('Something failed');
  });

  it('should extract message from object with error.message', () => {
    expect(service.extractErrorMessage({ error: { message: 'Server error' } })).toBe('Server error');
  });

  it('should extract message from object with message', () => {
    expect(service.extractErrorMessage({ message: 'Validation failed' })).toBe('Validation failed');
  });

  it('should extract message from object with detail (ProblemDetails)', () => {
    expect(service.extractErrorMessage({ detail: 'Not found', title: 'Error' })).toBe('Not found');
  });

  it('should extract message from object with title when no detail', () => {
    expect(service.extractErrorMessage({ title: 'Bad Request' })).toBe('Bad Request');
  });

  it('should extract validation errors from errors object', () => {
    const err = {
      errors: {
        Name: ['Required'],
        Email: ['Invalid format']
      }
    };
    const msg = service.extractErrorMessage(err);
    expect(msg).toContain('Name');
    expect(msg).toContain('Required');
    expect(msg).toContain('Email');
    expect(msg).toContain('Invalid format');
  });

  it('should return default message for unknown error', () => {
    expect(service.extractErrorMessage({})).toBe('An unknown error occurred');
  });

  it('should return default for null/undefined', () => {
    expect(service.extractErrorMessage(null)).toBe('An unknown error occurred');
  });

  it('should not throw when logError is called', () => {
    spyOn(console, 'error');
    service.logError(new Error('test'));
    expect(console.error).toHaveBeenCalledWith('[ErrorHandlingService]:', jasmine.any(Error));
  });

  it('should handle HttpErrorResponse with problem details', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { detail: 'Bad request detail', title: 'Bad Request' }
    });
    expect(service.extractErrorMessage(err)).toBe('Bad request detail');
  });

  it('should handle HttpErrorResponse with title only', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { title: 'Bad Request' }
    });
    expect(service.extractErrorMessage(err)).toBe('Bad Request');
  });

  it('should handle validation errors from HttpErrorResponse', () => {
    const err = new HttpErrorResponse({
      status: 422,
      error: {
        errors: {
          email: ['Invalid email'],
          password: ['Too short']
        }
      }
    });
    const msg = service.extractErrorMessage(err);
    expect(msg).toContain('email');
    expect(msg).toContain('password');
  });

  it('should return status text for HttpErrorResponse without body', () => {
    const err = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: null
    });
    expect(service.extractErrorMessage(err)).toContain('500');
  });

  it('should handle object with error.message', () => {
    expect(service.extractErrorMessage({ error: { message: 'Custom error' } })).toBe('Custom error');
  });

  it('should extract message from top-level message property', () => {
    expect(service.extractErrorMessage({ message: 'Top level message' })).toBe('Top level message');
  });

  it('should extract message from ProblemDetails with detail', () => {
    expect(service.extractErrorMessage({ detail: 'Problem detail', title: 'Error' })).toBe('Problem detail');
  });

  it('should extract validation errors from ProblemDetails', () => {
    const err = {
      title: 'Validation Failed',
      errors: {
        'FirstName': ['Required'],
        'LastName': ['Too long']
      }
    };
    const msg = service.extractErrorMessage(err);
    expect(msg).toContain('FirstName');
    expect(msg).toContain('Required');
  });

  it('should handle validation errors as non-array values', () => {
    const err = {
      errors: {
        username: 'Already exists'
      }
    };
    const msg = service.extractErrorMessage(err);
    expect(msg).toContain('username');
    expect(msg).toContain('Already exists');
  });

  it('should return default when no detail or title in ProblemDetails', () => {
    const err = { errors: {} };
    expect(service.extractErrorMessage(err)).toBe('An error occurred');
  });

  it('should log error with context', () => {
    spyOn(console, 'error');
    service.logError(new Error('test'), 'TestContext');
    expect(console.error).toHaveBeenCalledWith('[ErrorHandlingService] [TestContext]:', jasmine.any(Error));
  });

  it('should handle Error object message extraction', () => {
    const error = new Error('Direct error message');
    expect(service.extractErrorMessage(error)).toBe('Direct error message');
  });

  it('should extract from HttpErrorResponse with nested error.error.message', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: {
        error: {
          message: 'Nested error message'
        }
      }
    });
    expect(service.extractErrorMessage(err)).toBe('Nested error message');
  });

  it('should handle empty validation errors object', () => {
    const err = { errors: {} };
    expect(service.extractErrorMessage(err)).toBe('An error occurred');
  });

  it('should return default fallback for unrecognized object', () => {
    expect(service.extractErrorMessage({ unknown: 'field' })).toBe('An unknown error occurred');
  });

  it('should recognize ProblemDetails format with only errors field', () => {
    const err = {
      errors: {
        field: ['error message']
      }
    };
    const msg = service.extractErrorMessage(err);
    expect(msg).toContain('field');
    expect(msg).toContain('error message');
  });
});
