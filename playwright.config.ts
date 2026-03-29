import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import type { MonocartReporterOptions } from 'monocart-reporter';

const pwCoverage = process.env['PW_COVERAGE'] === '1';
const ALLOWED_COVERAGE_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function isAllowedCoverageEntry(entryUrl: string): boolean {
  try {
    const parsed = new URL(entryUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return ALLOWED_COVERAGE_HOSTS.has(parsed.hostname);
  } catch {
    // Ignore malformed/non-URL entries from coverage input.
    return false;
  }
}

function getMonocartReporterOptions(): MonocartReporterOptions {
  const reportDir = path.resolve(process.cwd(), 'playwright-report');
  const codeCoverageDir = path.join(reportDir, 'code-coverage');
  return {
    name: 'ERP Aspire E2E coverage',
    outputFile: path.join(reportDir, 'monocart-report.html'),
    coverage: {
      outputDir: codeCoverageDir,
      reportPath: path.join(codeCoverageDir, 'v8', 'index.html'),
      reports: [
        ['v8', { outputFile: 'v8/index.html', inline: true, metrics: ['lines'] }],
        ['console-summary', { metrics: ['lines'] }],
        ['lcovonly', { file: 'lcov/lcov.info' }],
      ],
      entryFilter: (entry) => {
        const url = entry.url ?? '';
        return isAllowedCoverageEntry(url);
      },
      sourceFilter: (sourcePath: string) => /src\//u.test(sourcePath),
    },
  };
}

/**
 * Playwright configuration for Angular E2E testing with API mocking
 */
export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: pwCoverage
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['monocart-reporter', getMonocartReporterOptions()],
      ]
    : 'html',
  use: {
    baseURL: 'http://localhost:4201',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm exec http-server dist/temp-ng-project/browser -p 4201 --proxy http://localhost:4201?',
    url: 'http://localhost:4201',
    reuseExistingServer: false,
    timeout: 60 * 1000,
  },
});
