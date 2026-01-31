import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersListComponent } from './users-list.component';
import { UsersService } from '../../../core/services/users.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, throwError } from 'rxjs';
import { PaginatedResponse, User } from '../../../types/api.types';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;

  const mockUsers: PaginatedResponse<User> = {
    items: [
      {
        id: '1',
        username: 'u1',
        email: 'u1@e.com',
        roles: [{ id: 'r1', name: 'USER', permissions: [], createdAt: '', createdBy: '' }],
        permissions: [],
        firstName: 'U',
        lastName: '1',
        isActive: true,
        emailConfirmed: true,
        isExternalLogin: false,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    ] as any,
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };

  const mockResponse = { items: mockUsers.items, total: 1 };

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);

    usersServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ UsersListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(UsersListComponent, {
      set: {
        providers: [
          { provide: NzModalService, useValue: modalServiceSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(component.users.length).toBe(1);
    expect(component.total).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('should search users', fakeAsync(() => {
    component.searchTerm = 'query';
    component.onSearch();
    tick(300);
    expect(usersServiceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ SearchTerm: 'query', page: 1 }));
  }));

  it('should delete user', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    usersServiceSpy.delete.and.returnValue(of(undefined));
    component.deleteUser('1');
    expect(usersServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    spyOn(console, 'error');
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    usersServiceSpy.delete.and.returnValue(throwError(() => new Error('Failed')));
    component.deleteUser('1');
    expect(messageServiceSpy.error).toHaveBeenCalled();
  });


  it('should export to XLSX', () => {
    const mockBlob = new Blob(['data'], { type: 'application/octet-stream' });
    usersServiceSpy.exportToXlsx.and.returnValue(of(mockBlob));
    
    component.exportToXlsx('users.xlsx');
    
    expect(usersServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(fileServiceSpy.saveFile).toHaveBeenCalledWith(mockBlob, 'users.xlsx');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to XLSX successfully');
  });

  it('should export to PDF', () => {
    const mockBlob = new Blob(['data'], { type: 'application/pdf' });
    usersServiceSpy.exportToPdf.and.returnValue(of(mockBlob));
    
    component.exportToPdf('users.pdf');
    
    expect(usersServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(fileServiceSpy.saveFile).toHaveBeenCalledWith(mockBlob, 'users.pdf');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to PDF successfully');
  });
});


