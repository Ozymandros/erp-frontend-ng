import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RolesListComponent } from './roles-list.component';
import { RolesService } from '../../../core/services/roles.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';

describe('RolesListComponent', () => {
  let component: RolesListComponent;
  let fixture: ComponentFixture<RolesListComponent>;
  let rolesServiceSpy: jasmine.SpyObj<RolesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Admin', description: 'Desc', permissions: [], createdAt: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);

    rolesServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ RolesListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(RolesListComponent, {
      set: {
        providers: [
          { provide: NzModalService, useValue: modalServiceSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load roles', () => {
    expect(component.roles.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete role', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    rolesServiceSpy.delete.and.returnValue(of(undefined));
    component.deleteRole('1');
    expect(rolesServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});

