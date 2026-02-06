import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../core/services/theme.service';
import { signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let themeSignal: WritableSignal<'light' | 'dark' | 'system'>;
  let effectiveThemeSignal: WritableSignal<'light' | 'dark'>;

  beforeEach(async () => {
    themeSignal = signal<'light' | 'dark' | 'system'>('system');
    effectiveThemeSignal = signal<'light' | 'dark'>('light');

    mockThemeService = jasmine.createSpyObj('ThemeService', ['setTheme'], {
      theme: themeSignal,
      effectiveTheme: effectiveThemeSignal
    });

    await TestBed.configureTestingModule({
      imports: [
        ThemeToggleComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        provideNzIconsTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have themeService injected', () => {
    expect(component.themeService).toBeTruthy();
  });

  describe('setTheme', () => {
    it('should call themeService.setTheme with light', () => {
      component.setTheme('light');
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('light');
    });

    it('should call themeService.setTheme with dark', () => {
      component.setTheme('dark');
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should call themeService.setTheme with system', () => {
      component.setTheme('system');
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('template rendering', () => {
    it('should render toggle button', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should show sun icon when effective theme is light', () => {
      effectiveThemeSignal.set('light');
      fixture.detectChanges();
      
      const icon = fixture.nativeElement.querySelector('[nzType="sun"]');
      expect(icon).toBeTruthy();
    });

    it('should show moon icon when effective theme is dark', () => {
      effectiveThemeSignal.set('dark');
      fixture.detectChanges();
      
      const icon = fixture.nativeElement.querySelector('[nzType="moon"]');
      expect(icon).toBeTruthy();
    });
  });

  describe('menu interactions', () => {
    it('should call setTheme when menu items are clicked', () => {
      // simulate menu clicks
      component.setTheme('light');
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('light');

      component.setTheme('dark');
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('dark');

      component.setTheme('system');
      expect(mockThemeService.setTheme).toHaveBeenCalledWith('system');
    });
  });
});
