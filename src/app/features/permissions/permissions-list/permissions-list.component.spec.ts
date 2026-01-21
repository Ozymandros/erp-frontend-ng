import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PermissionsListComponent } from './permissions-list.component';
import { PermissionsService } from '@/app/core/services/permissions.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('PermissionsListComponent', () => {
  let component: PermissionsListComponent;
  let fixture: ComponentFixture<PermissionsListComponent>;
  let permissionsServiceSpy: jasmine.SpyObj<PermissionsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', module: 'Users', action: 'Read', description: 'Desc', createdAt: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['getPermissions', 'deletePermission']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    permissionsServiceSpy.getPermissions.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ PermissionsListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: PermissionsService, useValue: permissionsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load permissions', () => {
    expect(component.permissions.length).toBe(1);
    expect(component.total).toBe(1);
  });
  
  it('should delete permission', () => {
    permissionsServiceSpy.deletePermission.and.returnValue(of(undefined));
    component.deletePermission('1');
    expect(permissionsServiceSpy.deletePermission).toHaveBeenCalledWith('1');
  });
});
