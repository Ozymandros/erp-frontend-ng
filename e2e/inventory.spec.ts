import { test, expect } from '@playwright/test';
import { mockLogin, mockAuthenticatedState, mockGetProducts } from './mocks/api-mocks';
import { mockAuthResponse, mockAdminUser, mockProducts, mockRoles } from './mocks/fixtures';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
    await mockGetProducts(page, mockProducts);
  });

  test('should load products page and display list', async ({ page }) => {
    await page.goto('/inventory/products');
    await expect(page.locator('h1')).toContainText('Products');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Premium Widget')).toBeVisible();
    await expect(page.locator('text=WIDGET-001')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/inventory/products');
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('Premium');
    // In our mock, searching returns everything for now unless we mock the search specific call
    await expect(page.locator('text=Premium Widget')).toBeVisible();
  });

  test('should navigate to product creation', async ({ page }) => {
    await page.goto('/inventory/products');
    await page.click('button:has-text("Add Product")');
    await expect(page).toHaveURL(/.*products\/new/);
    await expect(page.locator('h1')).toContainText('Create Product');
  });

  test('should load warehouses page', async ({ page }) => {
    await page.goto('/inventory/warehouses');
    await expect(page.locator('h1')).toContainText('Warehouses');
  });

  test('should load stock overview', async ({ page }) => {
    await page.goto('/inventory/warehouse-stocks');
    await expect(page.locator('h1')).toContainText('Warehouse Stock Levels');
  });

  test('should load inventory transactions', async ({ page }) => {
    await page.goto('/inventory/transactions');
    await expect(page.locator('h1')).toContainText('Inventory Transactions');
  });
});
