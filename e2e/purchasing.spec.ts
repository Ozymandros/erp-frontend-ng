
import { test, expect } from '@playwright/test';
import { mockLogin, mockAuthenticatedState } from './mocks/api-mocks';
import { mockAuthResponse, mockAdminUser } from './mocks/fixtures';

test.describe('Purchasing Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
  });

  test('should load suppliers page and display list', async ({ page }) => {
    await page.goto('/purchasing/suppliers');
    await expect(page.locator('h1')).toContainText('Suppliers');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should navigate to purchase orders', async ({ page }) => {
    await page.goto('/purchasing/orders');
    await expect(page.locator('h1')).toContainText('Purchase Orders');
  });

  test('should open add supplier form', async ({ page }) => {
    await page.goto('/purchasing/suppliers');
    await expect(page.locator('button:has-text("Add Supplier")')).toBeVisible();
  });
});
