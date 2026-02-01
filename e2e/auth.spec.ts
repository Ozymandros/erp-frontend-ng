import { test, expect } from '@playwright/test';
import { mockLogin, mockAuthenticatedState } from './mocks/api-mocks';
import { mockAuthResponse, mockAdminUser } from './mocks/fixtures';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.goto('/login');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('should load login page', async ({ page }) => {
    await expect(page.locator('input[formControlName="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await mockLogin(page, mockAuthResponse);
    await mockAuthenticatedState(page, mockAdminUser);

    await page.fill('input[formControlName="email"]', 'admin@example.com');
    await page.fill('input[formControlName="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard (root path); avoid .* to prevent ReDoS
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1.dashboard-title')).toHaveText('Dashboard Overview');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    // NG-Zorro validation shows error tips
    await expect(page.locator('nz-form-control').filter({ hasText: 'Please input your email!' })).toBeVisible();
    await expect(page.locator('nz-form-control').filter({ hasText: 'Please input your password!' })).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.click('a[routerLink="/register"]');
    await expect(page).toHaveURL(/register/);
  });

  test('should persist session after page reload', async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
    await page.goto('/users'); 
    await expect(page).toHaveURL(/users/);
    
    await page.reload();
    await expect(page).toHaveURL(/users/);
  });

  test('should handle logout', async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
    await page.goto('/dashboard');
    
    // Open user menu and click logout
    await page.click('.ant-dropdown-trigger'); // User avatar/name
    await page.click('text=Logout');
    
    await expect(page).toHaveURL(/login/);
  });
});
