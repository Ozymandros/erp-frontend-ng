import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SafeJsonViewerComponent } from './safe-json-viewer.component';

describe('SafeJsonViewerComponent', () => {
  let fixture: ComponentFixture<SafeJsonViewerComponent>;
  let component: SafeJsonViewerComponent;
  let messageSpy: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [SafeJsonViewerComponent],
      providers: [{ provide: NzMessageService, useValue: messageSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SafeJsonViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create and prettify JSON in pre', () => {
    fixture.componentRef.setInput('value', '{"x":1}');
    fixture.detectChanges();
    const pre = fixture.nativeElement.querySelector('pre');
    expect(pre?.textContent).toContain('"x": 1');
  });

  it('should show em dash for null', () => {
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    const pre = fixture.nativeElement.querySelector('pre');
    expect(pre?.textContent?.trim()).toBe('—');
  });

  it('should render label and copy button aria label', () => {
    fixture.componentRef.setInput('label', 'Original value');
    fixture.componentRef.setInput('value', '{"a":1}');
    fixture.detectChanges();
    const copyBtn = fixture.nativeElement.querySelector('button.safe-json-viewer__copy');
    expect(copyBtn?.getAttribute('aria-label')).toBe('Copy Original value to clipboard');
  });

  it('should copy to clipboard on success', async () => {
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    fixture.componentRef.setInput('value', '{"x":1}');
    fixture.detectChanges();
    await component.copyToClipboard();
    expect(writeText).toHaveBeenCalled();
    expect(messageSpy.success).toHaveBeenCalledWith('Copied to clipboard');
  });

  it('should show error when clipboard copy fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jasmine.createSpy('writeText').and.rejectWith(new Error('denied')) },
      configurable: true,
    });
    fixture.componentRef.setInput('value', '{"x":1}');
    fixture.detectChanges();
    await component.copyToClipboard();
    expect(messageSpy.error).toHaveBeenCalledWith('Could not copy to clipboard');
  });

  it('should show expand control for large content', () => {
    const longJson = JSON.stringify({ lines: Array.from({ length: 20 }, (_, i) => i) }, null, 2);
    fixture.componentRef.setInput('value', longJson);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Expand');
    component.toggleExpanded();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Collapse');
  });

  it('should not show expand in compact mode', () => {
    const longJson = JSON.stringify({ lines: Array.from({ length: 20 }, (_, i) => i) }, null, 2);
    fixture.componentRef.setInput('value', longJson);
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Expand');
  });
});
