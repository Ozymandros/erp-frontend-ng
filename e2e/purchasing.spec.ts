
import { test, expect } from '@playwright/test';
import { mockAuthenticatedState, mockGetSuppliers, mockGetPurchaseOrders } from './mocks/api-mocks';
import { mockAdminUser, mockSuppliers, mockPurchaseOrders } from './mocks/fixtures';

test.describe('Purchasing Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
    await mockGetSuppliers(page, mockSuppliers);
    await mockGetPurchaseOrders(page, mockPurchaseOrders);
  });

  test('should load suppliers page and display list', async ({ page }) => {
    await page.goto('/purchasing/suppliers');
    await expect(page.getByRole('heading', { name: 'Suppliers Management' })).toBeVisible();
    await expect(page.locator('nz-table')).toBeVisible();
  });

  test('should navigate to purchase orders', async ({ page }) => {
    await page.goto('/purchasing/orders');
    await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible();
  });

  test('should open add supplier form', async ({ page }) => {
    await page.goto('/purchasing/suppliers');
    await expect(page.locator('button:has-text("Add Supplier")')).toBeVisible();
  });
});
