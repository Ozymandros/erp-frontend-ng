#!/usr/bin/env node
/**
 * Prints a reminder if overall coverage is below 80%.
 * Does not fail the build (exit 0). The 80% minimum is enforced by Karma thresholds (karma.conf.js).
 * See docs/TEST_COVERAGE.md.
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_SUMMARY_PATH = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const WARNING_THRESHOLD_PCT = 80;
const METRICS = ['statements', 'lines', 'branches', 'functions'];

function main() {
  if (!fs.existsSync(COVERAGE_SUMMARY_PATH)) {
    console.warn(
      '[coverage-warning] No coverage summary found at %s; run tests with --code-coverage first.',
      COVERAGE_SUMMARY_PATH
    );
    process.exit(0);
    return;
  }

  let summary;
  try {
    summary = JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf8'));
  } catch (e) {
    console.warn('[coverage-warning] Could not parse coverage summary:', e.message);
    process.exit(0);
    return;
  }

  // Use "total" key if present (standard istanbul json-summary); otherwise aggregate from files
  const total = summary.total || aggregateTotal(summary);
  if (!total) {
    process.exit(0);
    return;
  }

  const below = [];
  for (const metric of METRICS) {
    const pct = total[metric] && typeof total[metric].pct === 'number' ? total[metric].pct : 0;
    if (pct < WARNING_THRESHOLD_PCT) {
      below.push(`${metric}: ${pct.toFixed(1)}%`);
    }
  }

  if (below.length > 0) {
    console.warn(
      '[coverage-warning] Coverage is below %d%% (Sonar target). Consider adding tests.',
      WARNING_THRESHOLD_PCT
    );
    console.warn('[coverage-warning] Current:', below.join(', '));
  }

  process.exit(0);
}

function aggregateTotal(summary) {
  let combined = null;
  for (const key of Object.keys(summary)) {
    if (key === 'total') continue;
    const entry = summary[key];
    if (entry && typeof entry === 'object') {
      if (!combined) {
        combined = { statements: { total: 0, covered: 0 }, lines: { total: 0, covered: 0 }, branches: { total: 0, covered: 0 }, functions: { total: 0, covered: 0 } };
      }
      for (const m of METRICS) {
        if (entry[m]) {
          combined[m].total += entry[m].total || 0;
          combined[m].covered += entry[m].covered || 0;
        }
      }
    }
  }
  if (!combined) return null;
  const result = {};
  for (const m of METRICS) {
    const t = combined[m].total;
    result[m] = { pct: t === 0 ? 100 : (100 * combined[m].covered) / t };
  }
  return result;
}

main();
