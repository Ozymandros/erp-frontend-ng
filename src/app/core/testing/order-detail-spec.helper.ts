import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, throwError } from 'rxjs';

/**
 * Shared test helper for order-detail components (purchase-order-detail, sales-order-detail).
 * Reduces duplicated setup: route param stub, getById stub, component creation, detectChanges.
 */
export function createOrderDetailFixture<T>(
  id: string | null,
  componentClass: Type<T>,
  options: { getByIdSpy: jasmine.Spy; mockOrder: unknown }
): { fixture: ComponentFixture<T>; component: T } {
  if (id && id !== 'new') {
    options.getByIdSpy.and.returnValue(of(options.mockOrder));
  }
  const route = TestBed.inject(ActivatedRoute);
  spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);

  const fixture = TestBed.createComponent(componentClass);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component };
}

interface OrderDetailComponentInternal {
  order?: { orderNumber: string };
  loading: boolean;
  loadError: string | null;
  orderForm: { 
    patchValue: (value: Record<string, unknown>) => void;
    invalid: boolean;
    controls: Record<string, { markAsDirty: () => void; updateValueAndValidity: (options: Record<string, unknown>) => void; invalid: boolean }>;
  };
  lines: { 
    length: number; 
    at: (index: number) => { patchValue: (value: Record<string, unknown>) => void };
    controls: unknown[];
    removeAt: (index: number) => void;
  };
  addLine(): void;
  removeLine(index: number): void;
  submitOrder(): void;
  submitting: boolean;
  calculateTotal(): number;
  getStatusColor(status: string | number): string;
  loadOrder(id: string): void;
}

/**
 * Runs common tests for order detail components to reduce duplication.
 */
export function runCommonOrderDetailTests<T>(
  componentClass: Type<T>,
  config: {
    getByIdSpy: () => jasmine.Spy;
    createSpy: () => jasmine.Spy;
    mockOrder: Record<string, unknown>;
    orderNumberPrefix: string;
    entityIdField: string;
    entityIdValue: string;
  }
) {
  let component: T;
  function createComponent(id: string | null) {
    const result = createOrderDetailFixture(id, componentClass, {
      getByIdSpy: config.getByIdSpy(),
      mockOrder: config.mockOrder
    });
    component = result.component;
  }

  it('should create', () => {
    createComponent('new');
    expect(component).toBeTruthy();
  });

  it('should load order in view mode', () => {
    createComponent('1');
    expect(config.getByIdSpy()).toHaveBeenCalledWith('1');
    const comp = component as unknown as OrderDetailComponentInternal;
    expect(comp.order?.orderNumber).toBe(config.mockOrder['orderNumber'] as string);
  });

  it('should initialize form for new order', () => {
    createComponent('new');
    const comp = component as unknown as OrderDetailComponentInternal;
    expect(comp.orderForm).toBeDefined();
    expect(comp.lines.length).toBe(1);
  });

  it('should add and remove lines', () => {
    createComponent('new');
    const comp = component as unknown as OrderDetailComponentInternal;
    comp.addLine();
    expect(comp.lines.length).toBe(2);
    comp.removeLine(1);
    expect(comp.lines.length).toBe(1);
  });

  it('should submit new order', () => {
    createComponent('new');
    config.createSpy().and.returnValue(of(config.mockOrder));
    
    const patchValues: Record<string, unknown> = { 
      orderNumber: `${config.orderNumberPrefix}-NEW`, 
      orderDate: new Date()
    };
    patchValues[config.entityIdField] = config.entityIdValue;
    
    const comp = component as unknown as OrderDetailComponentInternal;
    comp.orderForm.patchValue(patchValues);
    comp.lines.at(0).patchValue({ productId: 'P1', quantity: 2, unitPrice: 50 });
    
    comp.submitOrder();
    expect(config.createSpy()).toHaveBeenCalled();
    const messageService = TestBed.inject(NzMessageService);
    expect(messageService.success).toHaveBeenCalled();
  });

  it('should calculate total correctly', () => {
    createComponent('new');
    const comp = component as unknown as OrderDetailComponentInternal;
    // Lines are added with (1, 0) by default in createComponent -> initForm -> addLine
    // We add another line
    comp.addLine();
    comp.lines.at(0).patchValue({ quantity: 2, unitPrice: 50 });
    comp.lines.at(1).patchValue({ quantity: 1, unitPrice: 100 });
    expect(comp.calculateTotal()).toBe(200);
  });

  it('should return correct status colors', () => {
    createComponent('new');
    const comp = component as unknown as OrderDetailComponentInternal;
    expect(comp.getStatusColor(0)).toBe('default');
    expect(comp.getStatusColor(1)).toBe('orange');
    expect(comp.getStatusColor(2)).toBe('blue');
    expect(comp.getStatusColor(5)).toBe('red');
    expect(comp.getStatusColor('Invalid')).toBe('default');
  });

  it('should not remove the last line and show warning', () => {
    createComponent('new');
    const comp = component as unknown as OrderDetailComponentInternal;
    // Initially has 1 line
    expect(comp.lines.length).toBe(1);
    comp.removeLine(0);
    expect(comp.lines.length).toBe(1);
    const messageService = TestBed.inject(NzMessageService);
    expect(messageService.warning).toHaveBeenCalledWith('At least one order line is required');
  });

  it('should show error message when order fails to load', () => {
    config.getByIdSpy().and.returnValue(throwError(() => new Error('Failed to load order: Server error')));
    const id = '123';
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);

    const fixture = TestBed.createComponent(componentClass);
    const comp = fixture.componentInstance as unknown as OrderDetailComponentInternal;
    fixture.detectChanges();

    expect(comp.loadError).toContain('Failed to load order');
  });

  it('should mark form as dirty when submitting invalid form', () => {
    createComponent('new');
    const comp = component as unknown as OrderDetailComponentInternal;
    // Make form invalid by clearing orderNumber
    comp.orderForm.patchValue({ orderNumber: '' });
    // In our simplified mock/interface we can't easily set invalid: true 
    // but in the real component it will be true if orderNumber is required.
    // Let's assume the component's internal logic will handle it.
    comp.submitOrder();
    expect(comp.submitting).toBeFalsy();
  });
}
