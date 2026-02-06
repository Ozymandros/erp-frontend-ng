import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let createObjectURLSpy: jasmine.Spy;
  let revokeObjectURLSpy: jasmine.Spy;

  beforeEach(() => {
    createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
    revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    TestBed.configureTestingModule({
      providers: [FileService]
    });
    service = TestBed.inject(FileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create blob URL, create link with download and href, call click, and revoke URL', () => {
    const blob = new Blob(['content'], { type: 'text/plain' });
    const fileName = 'test.txt';
    const clickSpy = jasmine.createSpy('click');
    const fakeLink = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;
    spyOn(document, 'createElement').and.returnValue(fakeLink);

    service.saveFile(blob, fileName);

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    expect(fakeLink.download).toBe(fileName);
    expect(fakeLink.href).toBe('blob:mock-url');
    expect(clickSpy).toHaveBeenCalled();
  });
});
