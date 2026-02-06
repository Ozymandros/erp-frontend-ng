import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PermissionsListComponent } from './permissions-list.component';
import { PermissionsService } from '../../../core/services/permissions.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';
import { ActivatedRoute } from '@angular/router';

describe('PermissionsListComponent', () => {
  let component: PermissionsListComponent;
  let fixture: ComponentFixture<PermissionsListComponent>;
  let permissionsServiceSpy: jasmine.SpyObj<PermissionsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;

  const mockResponse = {
    items: [{ id: '1', module: 'Users', action: 'Read', description: 'Desc', createdAt: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);

    permissionsServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ PermissionsListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PermissionsService, useValue: permissionsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(PermissionsListComponent, {
      set: {
        providers: [
          { provide: NzModalService, useValue: modalServiceSpy }
        ]
      }
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
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    permissionsServiceSpy.delete.and.returnValue(of(undefined));
    component.deletePermission('1');
    expect(permissionsServiceSpy.delete).toHaveBeenCalledWith('1');

  });
});

