import { test, expect } from '@playwright/test';
import { mockLogin, mockAuthenticatedState, mockGetUsers } from './mocks/api-mocks';
import { mockAuthResponse, mockAdminUser, mockRoles } from './mocks/fixtures';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
    await mockGetUsers(page, [mockAdminUser]);
  });

  test('should load users page and display list', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=admin@example.com')).toBeVisible();
  });

  test('should navigate to roles page', async ({ page }) => {
    await page.goto('/roles');
    await expect(page.locator('h1')).toContainText('Role Management');
  });

  test('should navigate to permissions page', async ({ page }) => {
    await page.goto('/permissions');
    await expect(page.locator('h1')).toContainText('Permission Management');
  });

  test('should open create user form', async ({ page }) => {
    await page.goto('/users');
    // Angular component uses nz-table with search/actions
    // For now we just check the button
    await expect(page.locator('button:has-text("Add User")')).toBeVisible();
  });
});
