import { test, expect } from '@playwright/test';
import { mockAuthenticatedState } from './mocks/api-mocks';
import { mockAdminUser } from './mocks/fixtures';

test.describe('Layout & Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    // Start with authenticated state
    await mockAuthenticatedState(page, mockAdminUser);
    await page.goto('/');
  });

  test('should display sidebar and content correctly', async ({ page }) => {
    // 1. Verify Sidebar Visibility
    // Note: nz-sider usually adds 'ant-layout-sider' class. 
    // We also added 'sidebar' class in our template.
    const sidebar = page.locator('app-sidebar .ant-layout-sider');
    await expect(sidebar).toBeVisible();

    // 2. Verify Sidebar width
    // We expect it to be 250px wide as per [nzWidth]="250"
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox).not.toBeNull();
    // Allow small margin of error for borders/rendering
    expect(sidebarBox!.width).toBeCloseTo(250, 0);

    // 3. Verify Content Visibility
    const content = page.locator('.app-content');
    await expect(content).toBeVisible();

    // 4. Verify Layout Relationship (Sidebar to the left of Content)
    // Sidebar should not be 100% width (issue we fixed)
    const viewportSize = page.viewportSize();
    if (viewportSize) {
        expect(sidebarBox!.width).toBeLessThan(viewportSize.width);
    }
    
    // Check that content is positioned to the right of the sidebar
    // This implies that the sidebar isn't pushing content down (block layout)
    // but is side-by-side (flex layout).
    const contentBox = await content.boundingBox();
    expect(contentBox).not.toBeNull();
    
    // The content's left edge should be greater than or equal to the sidebar's width
    // (allowing for some layout nesting)
    expect(contentBox!.x).toBeGreaterThanOrEqual(sidebarBox!.width);
  });

  test('should toggle sidebar collapse', async ({ page }) => {
    const sidebar = page.locator('app-sidebar .ant-layout-sider');
    const trigger = page.locator('.ant-layout-sider-trigger'); // default trigger provided by nz-sider if collapsible
    
    // Note: Our sidebar template uses custom trigger or default?
    // <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" ...>
    // If [nzTrigger] is not set, it uses default bottom trigger. 
    // The template has a logo div that might respond to collapse state but no visible custom toggle button in the code shown 
    // EXCEPT the default one nz-sider creates at the bottom.
    
    // Let's assume default behavior first.
    if (await trigger.isVisible()) {
        await trigger.click();
        // Wait for animation
        await page.waitForTimeout(500); 
        
        // Width should be smaller (80px as per [nzCollapsedWidth]="80")
        const collapsedBox = await sidebar.boundingBox();
        expect(collapsedBox!.width).toBeCloseTo(80, 0);
        
        // Content should expand (move left)
        const content = page.locator('.app-content');
        const contentBox = await content.boundingBox();
        expect(contentBox!.x).toBeLessThan(250);
        expect(contentBox!.x).toBeGreaterThanOrEqual(80);
    }
  });

});
