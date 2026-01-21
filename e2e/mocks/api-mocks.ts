import { Page, Route } from '@playwright/test';

/**
 * API Mocking utilities for Playwright E2E tests
 */

export interface MockOptions {
  status?: number;
  delay?: number;
  contentType?: string;
}

export async function mockApiSuccess<T>(
  page: Page,
  urlPattern: string | RegExp,
  responseData: T,
  options: MockOptions = {}
): Promise<void> {
  const { status = 200, delay = 0, contentType = 'application/json' } = options;
  
  await page.route(urlPattern, async (route: Route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await route.fulfill({
      status,
      contentType,
      body: JSON.stringify(responseData),
    });
  });
}

export async function mockApiError(
  page: Page,
  urlPattern: string | RegExp,
  errorMessage: string,
  status: number = 400,
  options: MockOptions = {}
): Promise<void> {
  const { delay = 0 } = options;
  
  await page.route(urlPattern, async (route: Route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: {
          code: 'MockError',
          message: errorMessage
        }
      }),
    });
  });
}

export async function mockPaginatedResponse<T>(
  page: Page,
  urlPattern: string | RegExp,
  items: T[],
  page_num: number = 1,
  pageSize: number = 10,
  options: MockOptions = {}
): Promise<void> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page_num - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  
  await mockApiSuccess(page, urlPattern, {
    items: pageItems,
    page: page_num,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: page_num > 1,
    hasNextPage: page_num < totalPages,
  }, options);
}

// Service Mocks
export async function mockLogin(page: Page, authResponse: any): Promise<void> {
  await mockApiSuccess(page, '**/auth/api/auth/login', { success: true, data: authResponse });
}

export async function mockGetCurrentUser(page: Page, user: any): Promise<void> {
  await mockApiSuccess(page, '**/auth/api/users/me', { success: true, data: user });
}

export async function mockGetProducts(page: Page, products: any[]): Promise<void> {
  await mockPaginatedResponse(page, '**/inventory/api/inventory/products**', products);
}

export async function mockGetUsers(page: Page, users: any[]): Promise<void> {
  await mockPaginatedResponse(page, '**/auth/api/users**', users);
}

export async function mockAuthenticatedState(page: Page, user: any): Promise<void> {
  await mockGetCurrentUser(page, user);
  // Set session storage
  await page.addInitScript((u) => {
    window.sessionStorage.setItem('access_token', 'mock-token');
    window.sessionStorage.setItem('token_expiry', (Date.now() + 3600000).toString());
  }, user);
}
