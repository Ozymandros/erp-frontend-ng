import { test, expect } from '@playwright/test';
import { mockAuthenticatedState, mockGetCustomers, mockGetSalesOrders } from './mocks/api-mocks';
import { mockAdminUser, mockCustomers, mockSalesOrders } from './mocks/fixtures';

test.describe('Sales Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
    await mockGetCustomers(page, mockCustomers);
    await mockGetSalesOrders(page, mockSalesOrders);
  });

  test('should load customers page and display list', async ({ page }) => {
    await page.goto('/sales/customers');
    await expect(page.getByRole('heading', { name: 'Customers Management' })).toBeVisible();
    await expect(page.locator('nz-table')).toBeVisible();
  });

  test('should navigate to sales orders', async ({ page }) => {
    await page.goto('/sales/orders');
    await expect(page.getByRole('heading', { name: 'Sales Orders' })).toBeVisible();
  });

  test('should open add customer form', async ({ page }) => {
    await page.goto('/sales/customers');
    await expect(page.locator('button:has-text("Add Customer")')).toBeVisible();
  });
});
