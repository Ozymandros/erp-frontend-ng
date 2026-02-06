import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiClientService } from './http-client.service';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    spyOn(console, 'error');
    TestBed.configureTestingModule({
      providers: [
        ApiClientService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and use auth token in get request', (done) => {
    service.setAuthToken('test-token');
    service.get<{ id: string }>('/users/1').subscribe(data => {
      expect(data).toEqual({ id: '1' });
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes('/users/1'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({ id: '1' });
  });

  it('should get with params', (done) => {
    service.get<{ items: unknown[] }>('/users', { page: 1, pageSize: 10 }).subscribe(data => {
      expect(data).toEqual({ items: [] });
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes('/users'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ items: [] });
  });

  it('should unwrap success response when response has success and data', (done) => {
    service.get<{ name: string }>('/me').subscribe(data => {
      expect(data).toEqual({ name: 'Admin' });
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes('/me'));
    req.flush({ success: true, data: { name: 'Admin' } });
  });

  it('should throw when response has success false with error message', (done) => {
    service.get('/fail').subscribe({
      error: err => {
        expect(err.message).toContain('Forbidden');
        done();
      }
    });
    const req = httpMock.expectOne(r => r.url.includes('/fail'));
    req.flush({ success: false, error: { message: 'Forbidden' } });
  });

  it('should post and return data', (done) => {
    service.post<{ id: string }>('/users', { name: 'Test' }).subscribe(data => {
      expect(data).toEqual({ id: '1' });
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes('/users') && r.method === 'POST');
    expect(req.request.body).toEqual({ name: 'Test' });
    req.flush({ id: '1' });
  });

  it('should put and return data', (done) => {
    service.put<{ id: string }>('/users/1', { name: 'Updated' }).subscribe(data => {
      expect(data).toEqual({ id: '1' });
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes('/users/1') && r.method === 'PUT');
    expect(req.request.body).toEqual({ name: 'Updated' });
    req.flush({ id: '1' });
  });

  it('should delete', (done) => {
    service.delete<void>('/users/1').subscribe(() => {
      expect().nothing();
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes('/users/1') && r.method === 'DELETE');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should download as blob', (done) => {
    const blob = new Blob(['content'], { type: 'application/pdf' });
    service.download('/users/export-pdf').subscribe(data => {
      expect(data).toBeInstanceOf(Blob);
      expect(data.size).toBe(blob.size);
      done();
    });
    const req = httpMock.expectOne(r => r.url.includes('/users/export-pdf'));
    expect(req.request.responseType).toBe('blob');
    req.flush(blob);
  });

  it('should propagate error message from server response', (done) => {
    service.get('/error').subscribe({
      error: err => {
        expect(err.message).toContain('Server unavailable');
        done();
      }
    });
    const req = httpMock.expectOne(r => r.url.includes('/error'));
    req.flush(
      { message: 'Server unavailable' },
      { status: 503, statusText: 'Service Unavailable' }
    );
  });

  it('should clear auth token when set to null', () => {
    service.setAuthToken('token');
    service.setAuthToken(null);
    service.get<unknown>('/me').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/me'));
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should pass through absolute URL unchanged', (done) => {
    const absoluteUrl = 'https://api.example.com/v1/users';
    service.get<{ id: string }>(absoluteUrl).subscribe(data => {
      expect(data).toEqual({ id: '1' });
      done();
    });
    const req = httpMock.expectOne(absoluteUrl);
    req.flush({ id: '1' });
  });

  it('should skip null and undefined in buildParams', (done) => {
    service.get<unknown>('/search', { q: 'x', empty: null, missing: undefined }).subscribe(() => done());
    const req = httpMock.expectOne(r => r.url.includes('/search'));
    expect(req.request.params.get('q')).toBe('x');
    expect(req.request.params.has('empty')).toBeFalse();
    expect(req.request.params.has('missing')).toBeFalse();
    req.flush({});
  });

  it('should extract validation error messages from ProblemDetails', (done) => {
    service.get('/validate').subscribe({
      error: err => {
        expect(err.message).toContain('Name:');
        expect(err.message).toContain('required');
        done();
      }
    });
    const req = httpMock.expectOne(r => r.url.includes('/validate'));
    req.flush(
      { errors: { Name: ['required'], Email: ['invalid'] } },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('should use err.message when error has no error body', (done) => {
    service.get('/network').subscribe({
      error: err => {
        expect(err.message).toBe('Connection refused');
        done();
      }
    });
    const req = httpMock.expectOne(r => r.url.includes('/network'));
    req.flush(
      { message: 'Connection refused' },
      { status: 0, statusText: 'Unknown' }
    );
  });
});
