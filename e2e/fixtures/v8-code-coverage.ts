import type { BrowserType, Page } from '@playwright/test';
import { test } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

export type CollectV8CodeCoverageOptions = {
  browserType: BrowserType;
  page: Page;
  use: () => Promise<void>;
  enableJsCoverage: boolean;
  enableCssCoverage: boolean;
};

function browserSupportsV8CodeCoverage(browserType: BrowserType): boolean {
  return browserType.name() === 'chromium';
}

/**
 * Collects V8 JS/CSS coverage and forwards it to monocart-reporter (Chromium only).
 * When PW_COVERAGE is not set, behaves like a no-op passthrough.
 */
export async function collectV8CodeCoverageAsync(options: CollectV8CodeCoverageOptions): Promise<void> {
  if (process.env['PW_COVERAGE'] !== '1') {
    await options.use();
    return;
  }

  const v8Supported = browserSupportsV8CodeCoverage(options.browserType);
  const wantCoverage = options.enableJsCoverage || options.enableCssCoverage;
  if (!v8Supported || !wantCoverage) {
    await options.use();
    return;
  }

  const page = options.page;
  const starts: Promise<void>[] = [];

  if (options.enableJsCoverage) {
    starts.push(page.coverage.startJSCoverage({ resetOnNavigation: false }));
  }
  if (options.enableCssCoverage) {
    starts.push(page.coverage.startCSSCoverage({ resetOnNavigation: false }));
  }

  await Promise.all(starts);
  await options.use();

  const stops: Promise<unknown[]>[] = [];
  if (options.enableJsCoverage) {
    stops.push(page.coverage.stopJSCoverage());
  }
  if (options.enableCssCoverage) {
    stops.push(page.coverage.stopCSSCoverage());
  }

  const coverageReports = await Promise.all(stops);
  await addCoverageReport(coverageReports.flat(), test.info());
}
