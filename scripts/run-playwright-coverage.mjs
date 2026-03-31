#!/usr/bin/env node
/**
 * Playwright has no --coverage CLI flag. We set PW_COVERAGE=1 so playwright.config.ts
 * enables monocart-reporter and V8 coverage (Chromium-only). Runs Chromium project only.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, '..');

const env = { ...process.env, PW_COVERAGE: '1' };

const result = spawnSync(
  'pnpm',
  ['exec', 'playwright', 'test', '--project=chromium'],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env,
  },
);

process.exit(result.status === null ? 1 : result.status);
