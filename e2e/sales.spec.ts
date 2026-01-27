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
    await expect(page.locator('.page-header h1')).toContainText('Customers Management');
    await expect(page.locator('nz-table')).toBeVisible();
  });

  test('should navigate to sales orders', async ({ page }) => {
    await page.goto('/sales/orders');
    await expect(page.locator('.page-header h1')).toContainText('Sales Orders');
  });

  test('should open add customer form', async ({ page }) => {
    await page.goto('/sales/customers');
    await expect(page.locator('button:has-text("Add Customer")')).toBeVisible();
  });
});
