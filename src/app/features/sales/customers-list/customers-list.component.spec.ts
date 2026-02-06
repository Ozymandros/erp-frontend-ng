import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomersListComponent } from './customers-list.component';
import { CustomersService } from '../../../core/services/customers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CustomersListComponent', () => {
  let component: CustomersListComponent;
  let fixture: ComponentFixture<CustomersListComponent>;
  let customersServiceSpy: jasmine.SpyObj<CustomersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Customer 1', email: 'c@c.com', isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    customersServiceSpy = jasmine.createSpyObj('CustomersService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm', 'create', 'info', 'success', 'error', 'warning', 'open']);

    customersServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ CustomersListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomersService, useValue: customersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(CustomersListComponent, {
      set: {
        providers: [
          { provide: NzModalService, useValue: modalServiceSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers', () => {
    expect(component.customers.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete customer', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    customersServiceSpy.delete.and.returnValue(of(void 0));
    
    component.deleteCustomer({ id: '1' } as any);
    
    expect(customersServiceSpy.delete).toHaveBeenCalledWith('1');

    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should not call delete when user cancels modal', () => {
    modalServiceSpy.confirm.and.callFake((_options: any) => {
      // Do not call nzOnOk - user cancelled
      return undefined as any;
    });
    component.deleteCustomer({ id: '1' } as any);
    expect(customersServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should show error when load fails', (done) => {
    spyOn(console, 'error');
    customersServiceSpy.getAll.and.returnValue(throwError(() => new Error('Network error')));
    const fixture2 = TestBed.createComponent(CustomersListComponent);
    fixture2.detectChanges();
    setTimeout(() => {
      expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to load data');
      done();
    }, 50);
  });

  it('should call exportToXlsx and save file on export', (done) => {
    const blob = new Blob(['data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    customersServiceSpy.exportToXlsx.and.returnValue(of(blob));
    component.exportToXlsx('customers.xlsx');
    expect(customersServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to XLSX successfully');
    done();
  });

  it('should call exportToPdf and save file on export', (done) => {
    const blob = new Blob(['data'], { type: 'application/pdf' });
    customersServiceSpy.exportToPdf.and.returnValue(of(blob));
    component.exportToPdf('customers.pdf');
    expect(customersServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to PDF successfully');
    done();
  });

  it('should handle array response from getAll', (done) => {
    const arr = [{ id: '1', name: 'A', email: 'a@a.com', isActive: true }, { id: '2', name: 'B', email: 'b@b.com', isActive: false }];
    customersServiceSpy.getAll.and.returnValue(of(arr as any));
    const f = TestBed.createComponent(CustomersListComponent);
    f.detectChanges();
    setTimeout(() => {
      expect(f.componentInstance.customers.length).toBe(2);
      expect(f.componentInstance.total).toBe(2);
      done();
    }, 50);
  });

  it('should show error when delete fails', () => {
    spyOn(console, 'error');
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    customersServiceSpy.delete.and.returnValue(throwError(() => new Error('Delete failed')));
    component.deleteCustomer({ id: '1', name: 'Test', email: 't@t.com', isActive: true } as any);
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to delete customer "Test"');
  });

  it('should show error when exportToXlsx fails', () => {
    spyOn(console, 'error');
    customersServiceSpy.exportToXlsx.and.returnValue(throwError(() => new Error('Export failed')));
    component.exportToXlsx('out.xlsx');
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export to XLSX');
  });

  it('should show error when exportToPdf fails', () => {
    spyOn(console, 'error');
    customersServiceSpy.exportToPdf.and.returnValue(throwError(() => new Error('Export failed')));
    component.exportToPdf('out.pdf');
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export to PDF');
  });
});
