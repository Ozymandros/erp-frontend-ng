import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { OpportunityDetailComponent } from './opportunity-detail.component';
import { CrmOpportunitiesService } from '../../../core/services/crm-opportunities.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProductsService } from '../../../core/services/products.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

describe('OpportunityDetailComponent', () => {
  let component: OpportunityDetailComponent;
  let fixture: ComponentFixture<OpportunityDetailComponent>;

  beforeEach(async () => {
    const opportunitiesSpy = jasmine.createSpyObj('CrmOpportunitiesService', [
      'getById',
      'listLines',
      'create',
      'updateForecast',
      'moveStage',
      'addLine',
      'updateLine',
      'removeLine',
      'markLost',
      'markWon',
    ]);
    const customersSpy = jasmine.createSpyObj('CustomersService', ['getAll']);
    customersSpy.getAll.and.returnValue(of({ items: [], total: 0 }));
    const productsSpy = jasmine.createSpyObj('ProductsService', ['getAll']);
    productsSpy.getAll.and.returnValue(of({ items: [], total: 0 }));
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    authSpy.getCurrentUser.and.returnValue({ username: 'tester', permissions: [], isAdmin: false } as any);

    await TestBed.configureTestingModule({
      imports: [OpportunityDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CrmOpportunitiesService, useValue: opportunitiesSpy },
        { provide: CustomersService, useValue: customersSpy },
        { provide: ProductsService, useValue: productsSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error', 'warning']) },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null as string | null },
            },
          },
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpportunityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in new mode', () => {
    expect(component).toBeTruthy();
    expect(component.isNewMode).toBe(true);
  });
});
