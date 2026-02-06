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
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Open user menu by clicking avatar
    const avatarButton = page.locator('nz-avatar');
    await avatarButton.click();
    
    // Wait for and click the logout menu item
    const logoutItem = page.locator('[nz-menu-item]:has-text("Logout")');
    await logoutItem.waitFor({ state: 'visible', timeout: 5000 });
    await logoutItem.click();
    
    await expect(page).toHaveURL(/login/);
  });
});
