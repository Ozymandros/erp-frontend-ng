import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RolesListComponent } from './roles-list.component';
import { RolesService } from '../../../core/services/roles.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('RolesListComponent', () => {
  let component: RolesListComponent;
  let fixture: ComponentFixture<RolesListComponent>;
  let rolesServiceSpy: jasmine.SpyObj<RolesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Admin', description: 'Desc', permissions: [], createdAt: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getRoles', 'deleteRole']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    rolesServiceSpy.getRoles.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ RolesListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
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
    rolesServiceSpy.deleteRole.and.returnValue(of(undefined));
    component.deleteRole('1');
    expect(rolesServiceSpy.deleteRole).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
