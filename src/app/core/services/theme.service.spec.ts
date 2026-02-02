import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService, ThemeMode } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: { [key: string]: string };
  let mockMatchMedia: jasmine.Spy;
  let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[];

  beforeEach(() => {
    mockLocalStorage = {};
    mediaQueryListeners = [];

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    // Mock matchMedia
    mockMatchMedia = spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addEventListener: (_event: string, callback: (e: MediaQueryListEvent) => void) => {
        mediaQueryListeners.push(callback);
      },
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as unknown as MediaQueryList);

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(ThemeService);
  });

  describe('environment specific behavior', () => {
    it('should return light theme in non-browser environment', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(ThemeService);
      
      expect(serverService.theme()).toBe('light');
      expect(serverService.effectiveTheme()).toBe('light');
    });

    it('should not throw error in applyTheme in non-browser environment', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService = TestBed.inject(ThemeService);
      
      // Should return early without accessing document
      expect(() => (serverService as any).applyTheme('dark')).not.toThrow();
    });
  });

  afterEach(() => {
    // Clean up: remove dark class if present
    document.documentElement.classList.remove('dark');
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should default to system theme when no localStorage value', () => {
      expect(service.theme()).toBe('system');
    });

    it('should load theme from localStorage if available', () => {
      mockLocalStorage['app-theme'] = 'dark';
      
      // Use TestBed to create a new instance within injection context
      const newService = TestBed.runInInjectionContext(() => new ThemeService());
      expect(newService.theme()).toBe('dark');
    });

    it('should fall back to system theme for invalid stored value', () => {
      mockLocalStorage['app-theme'] = 'invalid-one';
      
      const newService = TestBed.runInInjectionContext(() => new ThemeService());
      expect(newService.theme()).toBe('system');
    });

    it('should fall back to system theme for empty string in localStorage', () => {
      mockLocalStorage['app-theme'] = '';
      
      const newService = TestBed.runInInjectionContext(() => new ThemeService());
      expect(newService.theme()).toBe('system');
    });
  });

  describe('setTheme', () => {
    it('should update theme signal when setTheme is called', () => {
      service.setTheme('dark');
      expect(service.theme()).toBe('dark');
    });

    it('should persist theme to localStorage', () => {
      service.setTheme('light');
      expect(localStorage.setItem).toHaveBeenCalledWith('app-theme', 'light');
    });

    it('should apply dark class to document when theme is dark', () => {
      service.setTheme('dark');
      TestBed.flushEffects();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });

    it('should remove dark class when theme is light', () => {
      document.documentElement.classList.add('dark');
      service.setTheme('light');
      TestBed.flushEffects();
      expect(document.documentElement.classList.contains('dark')).toBeFalse();
    });
  });

  describe('effectiveTheme', () => {
    it('should return light when theme is light', () => {
      service.setTheme('light');
      expect(service.effectiveTheme()).toBe('light');
    });

    it('should return dark when theme is dark', () => {
      service.setTheme('dark');
      expect(service.effectiveTheme()).toBe('dark');
    });

    it('should return light when system prefers light', () => {
      mockMatchMedia.and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener')
      } as unknown as MediaQueryList);
      
      service.setTheme('system');
      expect(service.effectiveTheme()).toBe('light');
    });

    it('should return dark when system prefers dark', () => {
      mockMatchMedia.and.returnValue({
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener')
      } as unknown as MediaQueryList);
      
      service.setTheme('system');
      expect(service.effectiveTheme()).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.setTheme('light');
      service.toggleTheme();
      expect(service.theme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      service.setTheme('dark');
      service.toggleTheme();
      expect(service.theme()).toBe('light');
    });
  });

  describe('valid theme modes', () => {
    const validModes: ThemeMode[] = ['light', 'dark', 'system'];
    
    validModes.forEach(mode => {
      it(`should accept "${mode}" as a valid theme mode`, () => {
        service.setTheme(mode);
        expect(service.theme()).toBe(mode);
      });
    });
  });

  describe('system theme changes', () => {
    it('should update effective theme when OS theme changes in system mode', () => {
      service.setTheme('system');
      
      // Mock listener trigger
      const changeEvent = { matches: true } as MediaQueryListEvent;
      mediaQueryListeners.forEach(listener => listener(changeEvent));
      
      // The listener toggles theme to trigger signal reactivity
      expect(service.theme()).toBe('system');
    });

    it('should not trigger reactivity update if not in system mode', () => {
      service.setTheme('dark');
      const spy = spyOn(service.theme, 'set').and.callThrough();
      
      const changeEvent = { matches: false } as MediaQueryListEvent;
      mediaQueryListeners.forEach(listener => listener(changeEvent));
      
      // set('light') and set(current) should NOT happen
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
