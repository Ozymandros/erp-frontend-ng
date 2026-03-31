import { test as baseTest } from '@playwright/test';
import type { CollectV8CodeCoverageOptions } from './v8-code-coverage';
import { collectV8CodeCoverageAsync } from './v8-code-coverage';

export { expect } from '@playwright/test';

interface AppFixtures {
  codeCoverageAutoTestFixture: void;
}

export const test = baseTest.extend<AppFixtures>({
  codeCoverageAutoTestFixture: [
    async ({ browser, page }, use) => {
      const options: CollectV8CodeCoverageOptions = {
        browserType: browser.browserType(),
        page,
        use,
        enableJsCoverage: true,
        enableCssCoverage: true,
      };
      await collectV8CodeCoverageAsync(options);
    },
    { auto: true },
  ],
});
