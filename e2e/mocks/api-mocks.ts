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
    console.log(`[Mock] Hit: ${route.request().url()} (Pattern: ${urlPattern})`);
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

/** Bounded query part for URL matching (avoids ReDoS from (\?.*)?$ backtracking). */
const OPTIONAL_QUERY = '(?:\\?[\\s\\S]{0,2048})?$';

export async function mockGetProducts(page: Page, products: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/inventory/api/inventory/products${OPTIONAL_QUERY}`), products);
}

export async function mockGetUsers(page: Page, users: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/auth/api/users${OPTIONAL_QUERY}`), users);
}

export async function mockGetRoles(page: Page, roles: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/auth/api/roles${OPTIONAL_QUERY}`), roles);
}

export async function mockGetPermissions(page: Page, permissions: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/auth/api/permissions${OPTIONAL_QUERY}`), permissions);
}

export async function mockGetInventoryTransactions(page: Page, transactions: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/inventory/api/inventory/transactions${OPTIONAL_QUERY}`), transactions);
}

export async function mockGetWarehouses(page: Page, warehouses: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/inventory/api/inventory/warehouses${OPTIONAL_QUERY}`), warehouses);
}

export async function mockGetWarehouseStocks(page: Page, stocks: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/inventory/api/inventory/warehouse-stocks${OPTIONAL_QUERY}`), stocks);
}

export async function mockGetCustomers(page: Page, customers: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/sales/api/sales/customers${OPTIONAL_QUERY}`), customers);
}

export async function mockGetSalesOrders(page: Page, orders: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/sales/api/sales/orders${OPTIONAL_QUERY}`), orders);
}

export async function mockGetPurchaseOrders(page: Page, orders: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/purchasing/api/purchasing/orders${OPTIONAL_QUERY}`), orders);
}

export async function mockGetSuppliers(page: Page, suppliers: any[]): Promise<void> {
  await mockPaginatedResponse(page, new RegExp(`/purchasing/api/purchasing/suppliers${OPTIONAL_QUERY}`), suppliers);
}

export async function mockLogout(page: Page): Promise<void> {
  await mockApiSuccess(page, '**/auth/api/auth/logout', { success: true });
}

export async function mockAuthenticatedState(page: Page, user: any): Promise<void> {
  await mockGetCurrentUser(page, user);
  await mockLogout(page);
  // Set session storage
  await page.addInitScript((u) => {
    window.sessionStorage.setItem('access_token', 'mock-token');
    window.sessionStorage.setItem('token_expiry', (Date.now() + 3600000).toString());
  }, user);
}
