import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppCardComponent } from './app-card.component';

describe('AppCardComponent', () => {
  let component: AppCardComponent;
  let fixture: ComponentFixture<AppCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass inputs to nz-card', () => {
    component.title = 'My Title';
    component.bordered = false;
    fixture.detectChanges();

    const cardDebug = fixture.debugElement.query(By.css('nz-card'));
    expect(cardDebug).toBeTruthy();
    const cardInstance = cardDebug.componentInstance as { nzTitle?: string; nzBordered?: boolean };
    expect(cardInstance.nzTitle).toBe('My Title');
    expect(cardInstance.nzBordered).toBe(false);
  });
});
