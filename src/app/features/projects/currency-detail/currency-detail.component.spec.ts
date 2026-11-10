import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CurrencyDetailComponent } from './currency-detail.component';
import { ProjectCurrenciesService } from '../../../core/services/project-currencies.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

describe('CurrencyDetailComponent', () => {
  let component: CurrencyDetailComponent;
  let fixture: ComponentFixture<CurrencyDetailComponent>;
  let currenciesSpy: jasmine.SpyObj<ProjectCurrenciesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    currenciesSpy = jasmine.createSpyObj('ProjectCurrenciesService', [
      'getByCode',
      'create',
      'update',
      'addExchangeRate',
      'deleteExchangeRate',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CurrencyDetailComponent],
      providers: [
        { provide: ProjectCurrenciesService, useValue: currenciesSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: routerSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in new mode', () => {
    expect(component.isNewMode).toBeTrue();
  });

  it('should create currency', () => {
    currenciesSpy.create.and.returnValue(of({ id: '1', code: 'USD', description: 'Dollar' }));
    component.form.patchValue({ code: 'usd', description: 'Dollar', symbol: '$' });
    component.save();
    expect(currenciesSpy.create).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });
});
