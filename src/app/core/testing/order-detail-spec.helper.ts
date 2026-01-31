import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

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
