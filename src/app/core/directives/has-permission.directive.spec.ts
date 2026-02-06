import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HasPermissionDirective } from './has-permission.directive';
import { PermissionService } from '../services/permission.service';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: '<div *appHasPermission>visible</div>'
})
class HostNoInputComponent {}

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `
    <div *appHasPermission>visible</div>
    <span *appHasPermission="{ module: 'Users', action: 'Read' }">with-permission</span>
  `
})
class HostComponent {}

describe('HasPermissionDirective', () => {
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;

  beforeEach(() => {
    permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    permissionServiceSpy.hasPermission.and.returnValue(true);
  });

  describe('when appHasPermission is not set', () => {
    let fixture: ComponentFixture<HostNoInputComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostNoInputComponent],
        providers: [{ provide: PermissionService, useValue: permissionServiceSpy }]
      }).compileComponents();
      fixture = TestBed.createComponent(HostNoInputComponent);
    });

    it('should show content', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent?.trim()).toBe('visible');
    });
  });

  describe('when appHasPermission is set', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [{ provide: PermissionService, useValue: permissionServiceSpy }]
      }).compileComponents();
      fixture = TestBed.createComponent(HostComponent);
    });

    it('should create the host component', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should show content when user has permission', () => {
      permissionServiceSpy.hasPermission.and.returnValue(true);
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('span'));
      expect(span?.nativeElement?.textContent?.trim()).toBe('with-permission');
      expect(permissionServiceSpy.hasPermission).toHaveBeenCalledWith('Users', 'Read');
    });

    it('should hide content when user does not have permission', () => {
      permissionServiceSpy.hasPermission.and.returnValue(false);
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('span'));
      expect(span).toBeNull();
    });
  });
});
