import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SafeJsonViewerComponent } from './safe-json-viewer.component';

describe('SafeJsonViewerComponent', () => {
  let fixture: ComponentFixture<SafeJsonViewerComponent>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [SafeJsonViewerComponent],
      providers: [{ provide: NzMessageService, useValue: messageSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SafeJsonViewerComponent);
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
});
