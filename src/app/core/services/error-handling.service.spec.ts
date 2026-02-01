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
});
