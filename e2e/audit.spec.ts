import { test, expect } from './fixtures/app-fixtures';
import {
  mockAuthenticatedState,
  mockGetEntityChanges,
  mockGetEntityChangeById,
} from './mocks/api-mocks';
import { mockAdminUser, mockEntityChanges } from './mocks/fixtures';

test.describe('Audit log', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedState(page, mockAdminUser);
    await mockGetEntityChanges(page, mockEntityChanges);
    await mockGetEntityChangeById(page, 'ec-1', mockEntityChanges[0]);
  });

  test('should load audit list and navigate to detail', async ({ page }) => {
    await page.goto('/audit/entity-changes');
    await expect(page.getByRole('heading', { name: 'Entity change audit log' })).toBeVisible();
    await expect(page.locator('nz-table')).toBeVisible();
    await expect(page.locator('nz-table').getByText('User', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'View' }).click();
    await expect(page.getByRole('heading', { name: 'Entity change details' })).toBeVisible();
    await expect(page.locator('pre').first()).toBeVisible();
    await expect(page.getByText('Property changes')).toBeVisible();
  });
});
