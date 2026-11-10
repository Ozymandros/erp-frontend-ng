import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CurrenciesListComponent } from './currencies-list.component';
import { ProjectCurrenciesService } from '../../../core/services/project-currencies.service';
import { AuthService } from '../../../core/services/auth.service';
import { FileService } from '../../../core/services/file.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../core/services/theme.service';

describe('CurrenciesListComponent', () => {
  let component: CurrenciesListComponent;
  let fixture: ComponentFixture<CurrenciesListComponent>;
  let currenciesSpy: jasmine.SpyObj<ProjectCurrenciesService>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;
  let fileSpy: jasmine.SpyObj<FileService>;

  beforeEach(async () => {
    currenciesSpy = jasmine.createSpyObj('ProjectCurrenciesService', [
      'list',
      'delete',
      'exportToXlsx',
      'exportToPdf',
    ]);
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    fileSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    currenciesSpy.list.and.returnValue(
      of([{ id: '1', code: 'EUR', description: 'Euro', isLocalCurrency: true }]),
    );

    await TestBed.configureTestingModule({
      imports: [CurrenciesListComponent],
      providers: [
        { provide: ProjectCurrenciesService, useValue: currenciesSpy },
        { provide: NzMessageService, useValue: messageSpy },
        { provide: FileService, useValue: fileSpy },
        {
          provide: AuthService,
          useValue: {
            getModulePermissions: () =>
              of({
                canRead: true,
                canCreate: true,
                canUpdate: true,
                canDelete: true,
                canExport: true,
                canExecute: false,
              }),
          },
        },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrenciesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load currencies', () => {
    expect(component.currencies.length).toBe(1);
    expect(component.currencies[0].code).toBe('EUR');
  });

  it('should handle load error', () => {
    currenciesSpy.list.and.returnValue(throwError(() => new Error('fail')));
    component.load();
    expect(messageSpy.error).toHaveBeenCalled();
  });

  it('should delete currency', () => {
    currenciesSpy.delete.and.returnValue(of(void 0));
    currenciesSpy.list.and.returnValue(of([]));
    component.deleteCurrency({ id: '1', code: 'EUR', description: 'Euro' });
    expect(currenciesSpy.delete).toHaveBeenCalledWith('EUR');
    expect(messageSpy.success).toHaveBeenCalled();
  });

  it('should export', () => {
    currenciesSpy.exportToXlsx.and.returnValue(of(new Blob()));
    currenciesSpy.exportToPdf.and.returnValue(of(new Blob()));
    component.exportToXlsx();
    component.exportToPdf();
    expect(fileSpy.saveFile).toHaveBeenCalledTimes(2);
  });
});
