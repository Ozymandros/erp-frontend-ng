import { test, expect } from '@playwright/test';
import { mockAuthenticatedState } from './mocks/api-mocks';
import { mockAdminUser } from './mocks/fixtures';

test.describe('Sales Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
  });

  test('should load customers page and display list', async ({ page }) => {
    await page.goto('/sales/customers');
    await expect(page.locator('h1')).toContainText('Customers');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should navigate to sales orders', async ({ page }) => {
    await page.goto('/sales/orders');
    await expect(page.locator('h1')).toContainText('Sales Orders');
  });

  test('should open add customer form', async ({ page }) => {
    await page.goto('/sales/customers');
    await expect(page.locator('button:has-text("Add Customer")')).toBeVisible();
  });
});
